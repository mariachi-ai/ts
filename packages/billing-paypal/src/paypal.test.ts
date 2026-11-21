import { DefaultBilling, MemoryBillingStore } from '@mariachi/billing';
import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { createPayPalBillingAdapter } from './adapter';
import { createPayPal, payPalRequestId } from './client';
import { PayPalError } from './errors';
import { settings } from './generated';
import { fromPayPalAmount, toPayPalAmount } from './money';
import { fakePayPal } from './testing';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger, tenantId: 't1' });
const config = { clientId: 'client-1', clientSecret: 'secret-1', environment: 'sandbox' as const };
const noWait = { sleep: async () => {} };
const token = { json: { access_token: 'A21AA-token', token_type: 'Bearer', expires_in: 32_400 } };
const order = (status: string, extra: object = {}) => ({
  id: '5O190127TN364715T',
  status,
  purchase_units: [{ amount: { currency_code: 'USD', value: '49.00' }, custom_id: 'paypal:t1', ...extra }],
  links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T', method: 'GET' }],
});
const capturedOrder = (captureStatus = 'COMPLETED', refunds: object[] = []) =>
  order('COMPLETED', { payments: { captures: [{ id: '3C679366HH908993F', status: captureStatus, amount: { currency_code: 'USD', value: '49.00' }, custom_id: 'paypal:t1' }], refunds } });

describe('the client', () => {
  it('signs in with client credentials, then creates an order with a stable PayPal-Request-Id, one span per call', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: order('CREATED') });
    const tracer = new TestTracer();
    const paypal = createPayPal(config, { fetch, tracer });
    const created = await paypal.orders.create(ctx, { amount: 4_900, currency: 'usd', customId: 'paypal:t1', idempotencyKey: 'order:42' });
    expect(created.id).toBe('5O190127TN364715T');

    const [auth, create] = fetch.requests;
    expect(auth!.url.href).toBe('https://api-m.sandbox.paypal.com/v1/oauth2/token');
    expect(auth!.headers.authorization).toBe(`Basic ${Buffer.from('client-1:secret-1').toString('base64')}`);
    expect(auth!.body).toBe('grant_type=client_credentials');
    expect(create!.url.href).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders');
    expect(create!.headers.authorization).toBe('Bearer A21AA-token');
    expect(create!.headers.prefer).toBe('return=representation');
    expect(create!.headers['paypal-request-id']).toBe(payPalRequestId('orders.create', 'order:42'));
    expect(create!.headers['paypal-request-id']).toHaveLength(36);
    expect(create!.json).toEqual({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: 'USD', value: '49.00' }, custom_id: 'paypal:t1' }] });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['paypal oauth.token', 'client', 'api-m.sandbox.paypal.com'],
      ['paypal orders.create', 'client', 'api-m.sandbox.paypal.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('keeps the access token until shortly before it expires, and calls the live host when live', async () => {
    let now = 1_000_000;
    const fetch = scriptedFetch(token, { json: order('CREATED') }, { json: order('CREATED') }, token, { json: order('CREATED') });
    const paypal = createPayPal({ ...config, environment: 'live' }, { fetch, clock: () => now });
    await paypal.orders.get(ctx, 'A');
    await paypal.orders.get(ctx, 'B');
    now += 32_400_000;
    await paypal.orders.get(ctx, 'C');
    expect(fetch.requests.map((r) => `${r.url.host}${r.url.pathname}`)).toEqual([
      'api-m.paypal.com/v1/oauth2/token',
      'api-m.paypal.com/v2/checkout/orders/A',
      'api-m.paypal.com/v2/checkout/orders/B',
      'api-m.paypal.com/v1/oauth2/token',
      'api-m.paypal.com/v2/checkout/orders/C',
    ]);
  });

  it("fails as a PayPalError with PayPal's issue, never its message, retrying only rate limits", async () => {
    const declined = { status: 422, json: { name: 'UNPROCESSABLE_ENTITY', message: 'card 4111 declined', debug_id: 'x', details: [{ issue: 'INSTRUMENT_DECLINED', description: 'nope' }] } };
    const fetch = scriptedFetch(token, { status: 429, headers: { 'retry-after': '0' } }, declined);
    const err = await createPayPal(config, { fetch, ...noWait }).orders.capture(ctx, { orderId: 'O1' }).catch((e) => e);
    expect(err).toBeInstanceOf(PayPalError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['paypal/instrument-declined', 'invalid-request', 'INSTRUMENT_DECLINED', 3]);
    expect(err.message).not.toContain('4111');
    // The retry sent the same request id, so PayPal captured at most once
    expect(fetch.requests[1]!.headers['paypal-request-id']).toBe(fetch.requests[2]!.headers['paypal-request-id']);
  });

  it("names the token endpoint's refusal, and checks input before calling", async () => {
    const fetch = scriptedFetch({ status: 401, json: { error: 'invalid_client', error_description: 'Client Authentication failed' } });
    const err = await createPayPal(config, { fetch }).plans.get(ctx, 'P-1').catch((e) => e);
    expect([err.code, err.providerCode]).toEqual(['paypal/invalid-client', 'invalid_client']);
    await expect(createPayPal(config, { fetch: scriptedFetch() }).orders.create(ctx, { amount: 1.5, currency: 'usd' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(createPayPal(config, { fetch: scriptedFetch() }).orders.create(ctx, { amount: 150, currency: 'huf' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    expect(() => createPayPal({ ...config, environment: 'production' as never })).toThrow();
  });
});

describe('amounts', () => {
  it('writes minor units as PayPal decimals and back, whole units for HUF, JPY and TWD', () => {
    expect(toPayPalAmount(4_905, 'usd')).toEqual({ currency_code: 'USD', value: '49.05' });
    expect(toPayPalAmount(7, 'eur').value).toBe('0.07');
    expect(toPayPalAmount(500, 'jpy').value).toBe('500');
    expect(toPayPalAmount(120_000, 'huf').value).toBe('1200');
    expect(() => toPayPalAmount(120_050, 'huf')).toThrow(/whole units/);
    expect(() => toPayPalAmount(100, 'xyz')).toThrow(/doesn't take payments/);
    expect(fromPayPalAmount({ currency_code: 'USD', value: '49.5' })).toBe(4_950);
    expect(fromPayPalAmount({ currency_code: 'JPY', value: '500' })).toBe(500);
    expect(fromPayPalAmount({ currency_code: 'HUF', value: '1200' })).toBe(120_000);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and keeps sandbox credentials out of production', () => {
    const env: Record<string, string> = { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's', PAYPAL_ENVIRONMENT: 'sandbox' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ clientId: 'id', clientSecret: 's', environment: 'sandbox' });
    const environment = settings.find((s) => s.key === 'environment')!;
    expect(checkSetting(environment, 'test', 'sandbox')).toBeNull();
    expect(checkSetting(environment, 'test', 'live')).toMatch(/sandbox/);
    expect(checkSetting(environment, 'production', 'sandbox')).toMatch(/live/);
    expect(settings.find((s) => s.key === 'clientId')!.public).toBe(true);
    expect(settings.find((s) => s.key === 'clientSecret')!.secret).toBe(true);
  });
});

describe('the billing adapter', () => {
  it('creates an order for a charge, which waits for the buyer, keyed by the order id', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: order('CREATED') });
    const tracer = new TestTracer();
    const adapter = createPayPalBillingAdapter(createPayPal(config, { fetch, tracer }));
    const charge = await adapter.createCharge({ customerId: 'paypal:t1', amount: 4_900, currency: 'usd' }, { idempotencyKey: 'k1' });
    expect(charge).toMatchObject({ id: '5O190127TN364715T', status: 'requires_action', amount: 4_900, currency: 'usd', tenantId: 't1' });
    assertProviderSpans(tracer.spans);
  });

  it("refunds the order's capture, in part", async () => {
    const fetch = scriptedFetch(token, { json: capturedOrder() }, { status: 201, json: { id: '1JU08902781691411', status: 'COMPLETED', amount: { currency_code: 'USD', value: '10.00' } } });
    const refund = await createPayPalBillingAdapter(createPayPal(config, { fetch })).refund('5O190127TN364715T', { amount: 1_000, reason: 'requested_by_customer' }, { idempotencyKey: 'r1' });
    expect(refund).toEqual({ id: '1JU08902781691411', chargeId: '5O190127TN364715T', tenantId: null, amount: 1_000, currency: 'usd', reason: 'requested_by_customer', status: 'succeeded' });
    expect(fetch.requests[2]!.url.pathname).toBe('/v2/payments/captures/3C679366HH908993F/refund');
    expect(fetch.requests[2]!.json).toEqual({ amount: { currency_code: 'USD', value: '10.00' } });
  });

  it("fails with the port's codes: a decline is billing/payment-failed, with PayPal's code in metadata", async () => {
    const fetch = scriptedFetch(token, { status: 422, json: { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'PAYER_CANNOT_PAY' }] } });
    const err = await createPayPalBillingAdapter(createPayPal(config, { fetch })).createCharge({ customerId: 'paypal:t1', amount: 100, currency: 'usd' }).catch((e) => e);
    expect(err.code).toBe('billing/payment-failed');
    expect(err.metadata).toMatchObject({ providerCode: 'PAYER_CANNOT_PAY', category: 'invalid-request', status: 422 });
    const missing = scriptedFetch(token, { status: 404, json: { name: 'RESOURCE_NOT_FOUND', details: [{ issue: 'INVALID_RESOURCE_ID' }] } });
    expect(await createPayPalBillingAdapter(createPayPal(config, { fetch: missing })).getSubscription('I-GONE')).toBeNull();
  });

  it('makes a subscription checkout whose URL is the approve link', async () => {
    const sub = { id: 'I-BW452GLLEP1G', status: 'APPROVAL_PENDING', plan_id: 'P-5ML4271244454362WXNWU5NQ', links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=BA-2M539689T3856352J' }] };
    const fetch = scriptedFetch(token, { status: 201, json: sub });
    const session = await createPayPalBillingAdapter(createPayPal(config, { fetch })).createCheckoutSession(
      { customerId: 'paypal:t1', priceId: 'P-5ML4271244454362WXNWU5NQ', mode: 'subscription', quantity: 2, successUrl: 'https://app.test/ok', cancelUrl: 'https://app.test/no' },
      { idempotencyKey: 'c1' },
    );
    expect(session).toEqual({ id: 'I-BW452GLLEP1G', url: sub.links[0]!.href });
    expect(fetch.requests[1]!.json).toEqual({
      plan_id: 'P-5ML4271244454362WXNWU5NQ',
      quantity: '2',
      custom_id: 'paypal:t1',
      application_context: { return_url: 'https://app.test/ok', cancel_url: 'https://app.test/no', user_action: 'SUBSCRIBE_NOW' },
    });
  });

  it('lists plans with their regular price, reading a plan whose cycles the list left out', async () => {
    const cycles = [{ tenure_type: 'REGULAR', sequence: 1, total_cycles: 0, frequency: { interval_unit: 'MONTH', interval_count: 1 }, pricing_scheme: { fixed_price: { currency_code: 'USD', value: '12.00' } } }];
    const fetch = scriptedFetch(
      token,
      { json: { plans: [{ id: 'P-1', product_id: 'PROD-1', name: 'Pro', status: 'ACTIVE', billing_cycles: cycles }, { id: 'P-2', name: 'Old', status: 'INACTIVE' }], total_pages: 1 } },
      { json: { id: 'P-2', product_id: 'PROD-1', name: 'Old', status: 'INACTIVE', billing_cycles: cycles } },
    );
    const plans = await createPayPalBillingAdapter(createPayPal(config, { fetch })).listPlans({ activeOnly: false });
    expect(plans.map((p) => [p.id, p.amount, p.currency, p.interval, p.active])).toEqual([
      ['P-1', 1_200, 'usd', 'month', true],
      ['P-2', 1_200, 'usd', 'month', false],
    ]);
    expect(fetch.requests[1]!.url.searchParams.get('page_size')).toBe('20');
  });

  it('fails with billing/not-supported for what PayPal cannot do, without calling it', async () => {
    const adapter = createPayPalBillingAdapter(createPayPal(config, { fetch: scriptedFetch() }));
    const expectations: Array<Promise<unknown>> = [
      adapter.updateSubscription('I-1', { priceId: 'P-2' }),
      adapter.previewSubscriptionChange('I-1', { priceId: 'P-2' }),
      adapter.cancelSubscription('I-1', { atPeriodEnd: true }),
      adapter.listSubscriptions('paypal:t1'),
      adapter.createCharge({ customerId: 'paypal:t1', amount: 1, currency: 'usd', paymentMethodId: 'pm_1' }),
      adapter.createSubscription({ customerId: 'paypal:t1', items: [{ priceId: 'P-1' }, { priceId: 'P-2' }] }),
      adapter.createSubscription({ customerId: 'paypal:t1', priceId: 'P-1', trialDays: 14 }),
      adapter.createCheckoutSession({ customerId: 'paypal:t1', priceId: 'P-1', mode: 'payment', successUrl: 'https://a.test', cancelUrl: 'https://a.test' }),
      adapter.createPortalSession('paypal:t1', 'https://a.test'),
      adapter.listInvoices('paypal:t1'),
      adapter.listPlans({ lookupKeys: ['pro'] }),
      adapter.reportUsage(),
      adapter.getCreditBalance('paypal:t1'),
      adapter.adjustCreditBalance(),
      adapter.parseWebhook('{}', 'sig', 'secret'),
    ];
    for (const attempt of expectations) await expect(attempt).rejects.toMatchObject({ code: 'billing/not-supported' });
  });

  it('works behind DefaultBilling: a local customer, a charge the buyer approves, a subscription and its cancel', async () => {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const store = new MemoryBillingStore();
    const billing = new DefaultBilling({ adapter: createPayPalBillingAdapter(paypal), store }, { logger });

    const customer = await billing.ensureCustomer(ctx, { email: 'a@b.test' }, { verify: true });
    expect(customer.id).toBe('paypal:t1');
    expect((await billing.ensureCustomer(ctx, { email: 'a@b.test' }, { verify: true })).id).toBe('paypal:t1');

    const charge = await billing.charge(ctx, { amount: 4_900, idempotencyKey: 'order:1' });
    expect(charge.status).toBe('requires_action');
    paypal.approveOrder(charge.id);
    const captured = await paypal.orders.capture(ctx, { orderId: charge.id });
    expect(captured.purchase_units?.[0]?.payments?.captures?.[0]?.status).toBe('COMPLETED');
    const refund = await billing.refund(ctx, charge.id, { amount: 900, idempotencyKey: 'refund:1' });
    expect([refund.amount, refund.status]).toEqual([900, 'succeeded']);

    const sub = await billing.subscribe(ctx, { priceId: plan.id, idempotencyKey: 'signup:1' });
    expect(sub.status).toBe('incomplete');
    paypal.approveSubscription(sub.id);
    const canceled = await billing.cancelSubscription(ctx, sub.id, { atPeriodEnd: false });
    expect(canceled.status).toBe('canceled');
    await expect(billing.cancelSubscription(ctx, sub.id)).rejects.toMatchObject({ code: 'billing/not-supported' });
  });
});
