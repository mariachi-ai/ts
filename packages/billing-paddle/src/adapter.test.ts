import { BillingError } from '@mariachi/core';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { PaddleBillingAdapter } from './adapter';

const apiKey = 'pdl_sdbx_apikey_01abc_secret';
const noWait = { sleep: async () => {} };
const data = (d: unknown) => ({ json: { data: d, meta: { request_id: 'r', pagination: { has_more: false, next: null } } } });
const paddleError = (status: number, code: string) => ({ status, json: { error: { type: 'request_error', code, detail: `secret detail for ${code}` } } });

const customer = (overrides = {}) => ({ id: 'ctm_1', email: 'a@b.co', name: 'Ada', status: 'active', custom_data: { tenantId: 't1' }, ...overrides });
const subscription = (overrides = {}) => ({
  id: 'sub_1',
  status: 'active',
  customer_id: 'ctm_1',
  currency_code: 'USD',
  next_billed_at: '2026-12-21T00:00:00Z',
  canceled_at: null,
  current_billing_period: { starts_at: '2026-11-21T00:00:00Z', ends_at: '2026-12-21T00:00:00Z' },
  scheduled_change: null,
  items: [{ status: 'active', quantity: 2, price: { id: 'pri_base' }, trial_dates: null }, { status: 'active', quantity: 1, price: { id: 'pri_addon' }, trial_dates: null }],
  custom_data: { tenantId: 't1' },
  ...overrides,
});
const transaction = (overrides = {}) => ({
  id: 'txn_1',
  status: 'completed',
  customer_id: 'ctm_1',
  subscription_id: 'sub_1',
  origin: 'web',
  collection_mode: 'automatic',
  currency_code: 'USD',
  custom_data: { tenantId: 't1' },
  items: [],
  details: {
    totals: { total: '3000', grand_total: '3000', currency_code: 'USD' },
    line_items: [
      { id: 'txnitm_a', price_id: 'pri_base', quantity: 2, totals: { total: '2000' } },
      { id: 'txnitm_b', price_id: 'pri_addon', quantity: 1, totals: { total: '1000' } },
    ],
  },
  payments: [],
  checkout: { url: 'https://app.test/pay?_ptxn=txn_1' },
  ...overrides,
});

function adapter(...responses: Parameters<typeof scriptedFetch>) {
  const fetch = scriptedFetch(...responses);
  const tracer = new TestTracer();
  return { fetch, tracer, paddle: new PaddleBillingAdapter({ apiKey, checkoutUrl: 'https://app.test/pay' }, { fetch, tracer, ...noWait }) };
}

describe('customers', () => {
  it('creates one with the tenant in custom_data, through a span with no tenant (the port has no ctx)', async () => {
    const { fetch, tracer, paddle } = adapter(data(customer()));
    expect(await paddle.createCustomer({ email: 'a@b.co', name: 'Ada', tenantId: 't1', metadata: { plan: 'pro' } })).toMatchObject({ id: 'ctm_1', tenantId: 't1' });
    expect(fetch.requests[0]!.json).toEqual({ email: 'a@b.co', name: 'Ada', custom_data: { plan: 'pro', tenantId: 't1' } });
    expect(tracer.spans[0]!.attributes['mariachi.tenant_id']).toBeUndefined();
    assertProviderSpans(tracer.spans);
  });

  it("returns the tenant's own customer when Paddle already has the email (a retried create), made active again", async () => {
    const { fetch, paddle } = adapter(paddleError(409, 'customer_already_exists'), data([customer({ status: 'archived' })]), data(customer()));
    expect((await paddle.createCustomer({ email: 'a@b.co', tenantId: 't1' })).id).toBe('ctm_1');
    expect(fetch.requests[1]!.url.search).toBe('?email=a%40b.co&status=active%2Carchived');
    expect([fetch.requests[2]!.method, fetch.requests[2]!.json]).toEqual(['PATCH', { status: 'active' }]);
  });

  it("refuses another tenant's customer with the same email", async () => {
    const { paddle } = adapter(paddleError(409, 'customer_already_exists'), data([customer({ custom_data: { tenantId: 'other' } })]));
    const err = await paddle.createCustomer({ email: 'a@b.co', tenantId: 't1' }).catch((e) => e);
    expect(err).toBeInstanceOf(BillingError);
    expect([err.code, err.metadata.providerCode]).toEqual(['billing/invalid-input', 'customer_already_exists']);
  });

  it('reads a missing or archived customer as none', async () => {
    const { paddle } = adapter(paddleError(404, 'not_found'), data(customer({ status: 'archived' })));
    expect(await paddle.getCustomer('ctm_gone')).toBeNull();
    expect(await paddle.getCustomer('ctm_1')).toBeNull();
  });
});

describe('subscriptions', () => {
  it('maps a subscription, with a scheduled cancel as cancelAtPeriodEnd', async () => {
    const { paddle } = adapter(data(subscription({ scheduled_change: { action: 'cancel', effective_at: '2026-12-21T00:00:00Z', resume_at: null } })));
    expect(await paddle.getSubscription('sub_1')).toMatchObject({
      planId: 'pri_base',
      quantity: 2,
      items: [{ priceId: 'pri_base', quantity: 2 }, { priceId: 'pri_addon', quantity: 1 }],
      status: 'active',
      tenantId: 't1',
      cancelAtPeriodEnd: true,
      cancelAt: new Date('2026-12-21T00:00:00Z'),
      currentPeriodEnd: new Date('2026-12-21T00:00:00Z'),
    });
  });

  it('sends the complete item list with the proration mode, keeping existing quantities and the tenant', async () => {
    const { fetch, paddle } = adapter(data(subscription()), data(subscription()));
    await paddle.updateSubscription('sub_1', { items: [{ priceId: 'pri_base', quantity: 5 }, { priceId: 'pri_new' }], metadata: { seats: '5' } });
    expect(fetch.requests[1]!.json).toEqual({
      items: [{ price_id: 'pri_base', quantity: 5 }, { price_id: 'pri_new', quantity: 1 }],
      proration_billing_mode: 'prorated_next_billing_period',
      custom_data: { tenantId: 't1', seats: '5' },
    });
  });

  it('changes the first item only for priceId, and maps each proration behaviour', async () => {
    const { fetch, paddle } = adapter(data(subscription()), data(subscription()), data(subscription()), data(subscription()));
    await paddle.updateSubscription('sub_1', { priceId: 'pri_team', prorationBehavior: 'always_invoice' });
    await paddle.updateSubscription('sub_1', { quantity: 3, prorationBehavior: 'none' });
    expect(fetch.requests[1]!.json).toEqual({ items: [{ price_id: 'pri_team', quantity: 2 }, { price_id: 'pri_addon' }], proration_billing_mode: 'prorated_immediately' });
    expect(fetch.requests[3]!.json).toEqual({ items: [{ price_id: 'pri_base', quantity: 3 }, { price_id: 'pri_addon' }], proration_billing_mode: 'do_not_bill' });
  });

  it('previews a change as what it would bill at the next renewal', async () => {
    const preview = {
      ...subscription(),
      immediate_transaction: null,
      next_transaction: {
        billing_period: { starts_at: '2026-12-21T00:00:00Z', ends_at: '2027-01-21T00:00:00Z' },
        details: { totals: { total: '4500', grand_total: '4500', currency_code: 'USD' }, line_items: [{ price_id: 'pri_team', totals: { total: '1500' }, product: { name: 'Team' }, proration: { rate: '0.5' } }, { price_id: 'pri_team', totals: { total: '3000' }, product: { name: 'Team' }, proration: null }] },
      },
      update_summary: { result: { action: 'charge', amount: '1500', currency_code: 'USD' } },
    };
    const { fetch, paddle } = adapter(data(subscription()), data(preview));
    expect(await paddle.previewSubscriptionChange('sub_1', { priceId: 'pri_team' })).toMatchObject({
      currency: 'usd',
      prorationAmount: 1500,
      invoiceTotal: 4500,
      invoiceAt: new Date('2026-12-21T00:00:00Z'),
      lines: [{ description: 'Team', amount: 1500, proration: true }, { description: 'Team', amount: 3000, proration: false }],
    });
    expect(fetch.requests[1]!.url.pathname).toBe('/subscriptions/sub_1/preview');
  });

  it('cancels at the period end or now, pauses now, and resumes a paused one or drops a scheduled change', async () => {
    const { fetch, paddle } = adapter(
      data(subscription()),
      data(subscription({ status: 'canceled' })),
      data(subscription({ status: 'paused' })),
      data(subscription({ status: 'paused' })),
      data(subscription()),
      data(subscription({ scheduled_change: { action: 'cancel', effective_at: '2026-12-21T00:00:00Z' } })),
      data(subscription()),
    );
    await paddle.cancelSubscription('sub_1', { atPeriodEnd: true });
    expect((await paddle.cancelSubscription('sub_1')).status).toBe('canceled');
    await paddle.pauseSubscription('sub_1');
    await paddle.resumeSubscription('sub_1');
    await paddle.resumeSubscription('sub_1');
    const sent = fetch.requests.map((r) => [r.method, r.url.pathname, r.json]);
    expect(sent).toEqual([
      ['POST', '/subscriptions/sub_1/cancel', { effective_from: 'next_billing_period' }],
      ['POST', '/subscriptions/sub_1/cancel', { effective_from: 'immediately' }],
      ['POST', '/subscriptions/sub_1/pause', { effective_from: 'immediately' }],
      ['GET', '/subscriptions/sub_1', undefined],
      ['POST', '/subscriptions/sub_1/resume', { effective_from: 'immediately' }],
      ['GET', '/subscriptions/sub_1', undefined],
      ['PATCH', '/subscriptions/sub_1', { scheduled_change: null }],
    ]);
  });
});

describe('checkout and money', () => {
  it('creates a checkout as a transaction on the payment page, with the tenant for the subscription it makes', async () => {
    const { fetch, paddle } = adapter(data(customer()), data(transaction({ status: 'ready', checkout: { url: 'https://app.test/pay?_ptxn=txn_9' }, id: 'txn_9' })));
    const session = await paddle.createCheckoutSession({ customerId: 'ctm_1', mode: 'subscription', items: [{ priceId: 'pri_base', quantity: 2 }, { priceId: 'pri_addon' }], successUrl: 'https://app.test/ok', cancelUrl: 'https://app.test/no', metadata: { from: 'pricing' } });
    expect(session).toEqual({ id: 'txn_9', url: 'https://app.test/pay?_ptxn=txn_9' });
    expect(fetch.requests[1]!.json).toEqual({
      items: [{ price_id: 'pri_base', quantity: 2 }, { price_id: 'pri_addon', quantity: 1 }],
      customer_id: 'ctm_1',
      custom_data: { from: 'pricing', tenantId: 't1' },
      checkout: { url: 'https://app.test/pay' },
    });
  });

  it('says what to set when Paddle has no payment link', async () => {
    const { paddle } = adapter(data(customer()), paddleError(400, 'transaction_default_checkout_url_not_set'));
    const err = await paddle.createCheckoutSession({ customerId: 'ctm_1', mode: 'payment', priceId: 'pri_base', successUrl: 'https://a.test', cancelUrl: 'https://a.test' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode]).toEqual(['billing/config', 'transaction_default_checkout_url_not_set']);
    expect(err.message).not.toContain('secret detail');
  });

  it("refuses what Paddle doesn't do, with the port's not-supported error", async () => {
    const { paddle, fetch } = adapter();
    await expect(paddle.createSubscription()).rejects.toMatchObject({ code: 'billing/not-supported' });
    await expect(paddle.createCharge()).rejects.toMatchObject({ code: 'billing/not-supported' });
    await expect(paddle.adjustCreditBalance()).rejects.toMatchObject({ code: 'billing/not-supported' });
    await expect(paddle.createCheckoutSession({ customerId: 'ctm_1', mode: 'subscription', priceId: 'pri_base', trialDays: 14, successUrl: 'https://a.test', cancelUrl: 'https://a.test' })).rejects.toMatchObject({ code: 'billing/not-supported' });
    expect(fetch.requests).toHaveLength(0);
  });

  it('refunds all of a transaction, or an amount taken from its line items in order', async () => {
    const adjustment = (total: string) => data({ id: 'adj_1', action: 'refund', transaction_id: 'txn_1', customer_id: 'ctm_1', reason: 'r', currency_code: 'USD', status: 'pending_approval', totals: { total } });
    const { fetch, paddle } = adapter(adjustment('3000'), data(transaction()), adjustment('2500'), data(transaction()));
    expect(await paddle.refund('txn_1')).toMatchObject({ id: 'adj_1', chargeId: 'txn_1', amount: 3000, status: 'pending' });
    expect(await paddle.refund('txn_1', { amount: 2500, reason: 'duplicate' })).toMatchObject({ amount: 2500, tenantId: 't1' });
    expect(fetch.requests[0]!.json).toEqual({ action: 'refund', type: 'full', transaction_id: 'txn_1', reason: 'requested_by_customer' });
    expect(fetch.requests[2]!.json).toEqual({
      action: 'refund',
      type: 'partial',
      transaction_id: 'txn_1',
      reason: 'duplicate',
      items: [{ item_id: 'txnitm_a', type: 'full' }, { item_id: 'txnitm_b', type: 'partial', amount: '500' }],
    });
    await expect(paddle.refund('txn_1', { amount: 9999 })).rejects.toMatchObject({ code: 'billing/invalid-input' });
    expect(fetch.requests).toHaveLength(4);
  });

  it('reads the portal link, invoices and credit', async () => {
    const { fetch, paddle } = adapter(
      data({ id: 'cpls_1', customer_id: 'ctm_1', urls: { general: { overview: 'https://customer-portal.paddle.com/cpl_1?token=t' } } }),
      data([transaction({ invoice_number: '2026-1', billing_period: { starts_at: '2026-11-21T00:00:00Z', ends_at: '2026-12-21T00:00:00Z' }, payments: [{ status: 'captured', captured_at: '2026-11-21T00:01:00Z' }] })]),
      data([{ customer_id: 'ctm_1', currency_code: 'EUR', balance: { available: '550', reserved: '0', used: '10' } }]),
    );
    expect(await paddle.createPortalSession('ctm_1', 'https://app.test/back')).toEqual({ url: 'https://customer-portal.paddle.com/cpl_1?token=t' });
    expect(await paddle.listInvoices('ctm_1', { limit: 5 })).toMatchObject([{ id: 'txn_1', number: '2026-1', amountDue: 3000, amountPaid: 3000, status: 'paid', paidAt: new Date('2026-11-21T00:01:00Z'), pdfUrl: null }]);
    expect(fetch.requests[1]!.url.searchParams.get('status')).toBe('billed,paid,completed,past_due');
    expect(await paddle.getCreditBalance('ctm_1', 'eur')).toEqual({ customerId: 'ctm_1', balance: 550, currency: 'eur' });
  });

  it('lists plans with their product, by the lookup key kept in custom_data', async () => {
    const price = (id: string, lookupKey?: string) => ({ id, product_id: 'pro_1', name: 'Monthly', billing_cycle: { interval: 'month', frequency: 1 }, unit_price: { amount: '1000', currency_code: 'USD' }, status: 'active', custom_data: lookupKey ? { lookupKey } : null, product: { id: 'pro_1', name: 'Pro', description: 'The pro plan', custom_data: { allowance: '100' } } });
    const { paddle } = adapter(data([price('pri_1', 'pro_monthly'), price('pri_2')]));
    expect(await paddle.listPlans({ lookupKeys: ['pro_monthly'] })).toEqual([
      { id: 'pri_1', productId: 'pro_1', name: 'Monthly', description: 'The pro plan', amount: 1000, currency: 'usd', interval: 'month', active: true, lookupKey: 'pro_monthly', metadata: { lookupKey: 'pro_monthly' }, productMetadata: { allowance: '100' } },
    ]);
  });

  it('reports usage as a usage event keyed by the idempotency key', async () => {
    const { fetch, paddle } = adapter({ status: 202, json: { data: {}, meta: {} } });
    await paddle.reportUsage({ customerId: 'ctm_1', metricName: 'api_calls', quantity: 2.5, timestamp: new Date('2026-11-21T10:00:00Z'), idempotencyKey: 'req-1' });
    expect(fetch.requests[0]!.json).toEqual({ events: [{ event_key: 'req-1', customer_id: 'ctm_1', action: 'api_calls', quantity: '2.5', occurred_at: '2026-11-21T10:00:00.000Z' }] });
    await expect(paddle.reportUsage({ customerId: 'ctm_1', metricName: 'Not An Action', quantity: 1, timestamp: new Date() })).rejects.toMatchObject({ code: 'billing/invalid-input' });
    await expect(paddle.reportUsage({ customerId: 'ctm_1', metricName: 'api_calls', quantity: 0, timestamp: new Date() })).rejects.toMatchObject({ code: 'billing/invalid-input' });
  });

  it("fails with the port's codes, Paddle's code in the metadata", async () => {
    const { paddle } = adapter({ status: 403, json: { error: { code: 'invalid_token' } } }, paddleError(400, 'subscription_payment_declined'), { status: 429, json: { error: { code: 'too_many_requests' } } }, { status: 429, json: { error: { code: 'too_many_requests' } } }, { status: 429, json: { error: { code: 'too_many_requests' } } });
    expect(await paddle.getSubscription('sub_1').catch((e) => [e.code, e.metadata.category])).toEqual(['billing/config', 'unauthorized']);
    expect(await paddle.updateSubscription('sub_1', {}).catch((e) => e.code)).toBe('billing/payment-failed');
    expect(await paddle.listSubscriptions('ctm_1').catch((e) => e.code)).toBe('billing/rate-limited');
  });

  it('is healthy when Paddle answers an authenticated call', async () => {
    expect(await adapter(data([])).paddle.isHealthy()).toBe(true);
    expect(await adapter({ status: 403, json: { error: { code: 'invalid_token' } } }).paddle.isHealthy()).toBe(false);
  });

  it('refuses settings it can’t use, with billing/config', () => {
    expect(() => new PaddleBillingAdapter({ apiKey: '' })).toThrow(expect.objectContaining({ code: 'billing/config' }));
    expect(() => new PaddleBillingAdapter({ apiKey: 'legacykey0123456789' })).toThrow(expect.objectContaining({ code: 'billing/config' }));
  });
});
