import type { Answer, FormResponse } from './schemas';

export type AnswerValue = string | number | boolean | string[] | null;

/**
 * A response's answers as plain values, by each field's `ref`: `{ email: 'a@b.co', plan: 'Team', seats: 4 }`.
 * Give fields a ref in the form builder and read them by it; a field's title and id change, its ref doesn't.
 * A choice is its label (or what was typed under "Other"); several choices are their labels; a file is its URL.
 */
export function answersByRef(response: Pick<FormResponse, 'answers'>): Record<string, AnswerValue> {
  const out: Record<string, AnswerValue> = {};
  for (const answer of response.answers) out[answer.field.ref] = answerValue(answer);
  return out;
}

export function answerValue(answer: Answer): AnswerValue {
  switch (answer.type) {
    case 'text':
      return answer.text ?? null;
    case 'email':
      return answer.email ?? null;
    case 'phone_number':
      return answer.phone_number ?? null;
    case 'url':
      return answer.url ?? null;
    case 'file_url':
      return answer.file_url ?? null;
    case 'date':
      return answer.date ?? null;
    case 'number':
      return answer.number ?? null;
    case 'boolean':
      return answer.boolean ?? null;
    case 'choice':
      return answer.choice?.label ?? answer.choice?.other ?? null;
    case 'choices':
      return [...(answer.choices?.labels ?? []), ...(answer.choices?.other ? [answer.choices.other] : [])];
    default:
      return answer.text ?? null;
  }
}
