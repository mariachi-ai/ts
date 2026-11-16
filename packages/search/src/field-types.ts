import { SearchError } from '@mariachi/core';

type TypesenseScalar = 'string' | 'int32' | 'int64' | 'float' | 'bool';
type TypesenseType = TypesenseScalar | `${TypesenseScalar}[]`;

const TYPE_MAP: Record<string, TypesenseScalar> = {
  string: 'string',
  number: 'float',
  int: 'int32',
  int32: 'int32',
  int64: 'int64',
  float: 'float',
  bool: 'bool',
  boolean: 'bool',
};

/** Maps a framework field type (or a Typesense type read back from the server) to a Typesense type. */
/** Whether two index definitions describe the same fields, whatever order they were written in. */
export function sameFields(
  a: { fields: Array<{ name: string; type: string; facet?: boolean; sort?: boolean; index?: boolean }>; defaultSortingField?: string },
  b: { fields: Array<{ name: string; type: string; facet?: boolean; sort?: boolean; index?: boolean }>; defaultSortingField?: string },
): boolean {
  const shape = (index: typeof a): string =>
    JSON.stringify({
      sortBy: index.defaultSortingField ?? null,
      fields: [...index.fields]
        .sort((x, y) => x.name.localeCompare(y.name))
        .map((f) => [f.name, mapFieldType(f.type), f.facet ?? false, f.sort ?? false, f.index ?? true]),
    });
  return shape(a) === shape(b);
}

export function mapFieldType(type: string): TypesenseType {
  const isArray = type.endsWith('[]');
  const mapped = TYPE_MAP[(isArray ? type.slice(0, -2) : type).toLowerCase()];
  if (!mapped) throw new SearchError('search/invalid-field-type', `Unsupported search field type "${type}"`);
  return isArray ? `${mapped}[]` : mapped;
}

export function isText(type: string): boolean {
  const mapped = mapFieldType(type);
  return mapped === 'string' || mapped === 'string[]';
}

