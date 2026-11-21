import { fromZodError } from '@mariachi/core';
import { z } from 'zod';
import type { EventItem, GaEvent } from './schemas';

/*
 * Google's recommended events an app most often sends from its server, with the parameters Google's reports read.
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events?client_type=gtag
 */

const Currency = z.string().regex(/^[A-Z]{3}$/, 'a currency is a 3-letter ISO 4217 code, such as USD');
const Money = z.number().finite();

const Method = z.object({ method: z.string().min(1).max(100).optional() }).strict();

/** `sign_up`: a user made an account. `method` is how (`email`, `Google`). */
export function signUp(input: z.input<typeof Method> = {}): GaEvent {
  const i = parse(Method, input);
  return { name: 'sign_up', params: compact({ method: i.method }) };
}

/** `login`: a user signed in. `method` is how (`email`, `Google`). */
export function login(input: z.input<typeof Method> = {}): GaEvent {
  const i = parse(Method, input);
  return { name: 'login', params: compact({ method: i.method }) };
}

const Item = z
  .object({
    itemId: z.string().min(1).optional(),
    itemName: z.string().min(1).optional(),
    /** The unit price, after any discount. */
    price: Money.optional(),
    /** 1 when left out. */
    quantity: z.number().int().positive().optional(),
    /** The unit discount. */
    discount: Money.optional(),
    coupon: z.string().min(1).optional(),
    affiliation: z.string().min(1).optional(),
    itemBrand: z.string().min(1).optional(),
    itemCategory: z.string().min(1).optional(),
    itemVariant: z.string().min(1).optional(),
    index: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((i) => i.itemId || i.itemName, 'an item needs an itemId or an itemName');

const Purchase = z
  .object({
    /** The order's own id. Google drops a second purchase with the same one, so a retried send counts once. */
    transactionId: z.string().min(1).max(100),
    /** The sum of price × quantity over the items, without shipping or tax. */
    value: Money,
    currency: Currency,
    items: z.array(Item).min(1),
    tax: Money.optional(),
    shipping: Money.optional(),
    coupon: z.string().min(1).optional(),
    /** `new` or `returning`; leave it out when unsure (a guest checkout). */
    customerType: z.enum(['new', 'returning']).optional(),
  })
  .strict();

/**
 * `purchase`: an order was paid. Send it from the server once the payment is confirmed (a payment webhook), with the
 * order's id as `transactionId`, so Google counts it once however often it arrives.
 */
export function purchase(input: z.input<typeof Purchase>): GaEvent {
  const i = parse(Purchase, input);
  return {
    name: 'purchase',
    params: compact({
      transaction_id: i.transactionId,
      value: i.value,
      currency: i.currency,
      tax: i.tax,
      shipping: i.shipping,
      coupon: i.coupon,
      customer_type: i.customerType,
      items: i.items.map(
        (item): EventItem =>
          compact({
            item_id: item.itemId,
            item_name: item.itemName,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount,
            coupon: item.coupon,
            affiliation: item.affiliation,
            item_brand: item.itemBrand,
            item_category: item.itemCategory,
            item_variant: item.itemVariant,
            index: item.index,
          }),
      ),
    }),
  };
}

const Lead = z
  .object({
    value: Money.optional(),
    currency: Currency.optional(),
    /** Where the lead came from (`Trade show`, `Contact form`). */
    leadSource: z.string().min(1).max(100).optional(),
  })
  .strict()
  .refine((l) => l.value === undefined || l.currency !== undefined, 'a value needs its currency');

/** `generate_lead`: someone asked to be contacted (a demo request, a contact form). */
export function generateLead(input: z.input<typeof Lead> = {}): GaEvent {
  const i = parse(Lead, input);
  return { name: 'generate_lead', params: compact({ value: i.value, currency: i.currency, lead_source: i.leadSource }) };
}

function compact<T extends Record<string, unknown>>(o: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]: Exclude<T[K], undefined> };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Google Analytics event');
  return parsed.data;
}
