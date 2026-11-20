import type ts from 'typescript';

/**
 * What `validate` reads from a file's syntax tree: the places where the framework's conventions
 * apply (procedures, routes, jobs, events, calls that take a context, service methods). Rules check
 * these facts; nothing here decides what is wrong.
 */

export type TypeScript = typeof ts;

export interface Param {
  /** The parameter's name; undefined for a destructuring pattern. */
  name?: string;
  /** The type annotation's text, if any. */
  type?: string;
  /** Named `ctx`/`context` (or `…Ctx`/`…Context`), or typed as a `…Context`. */
  ctx: boolean;
  line: number;
}

export interface FunctionFact {
  line: number;
  params: Param[];
}

/** An object literal's keys, or `unknown` when it can't be read (a spread, or not a literal). */
export type Keys = Set<string> | 'unknown';

export interface ProcedureFact {
  /** The literal name, when it is one. */
  name?: string;
  line: number;
  /** `register(name, def)` or `defineProcedure(def)`. */
  via: 'register' | 'defineProcedure';
  /** Keys of the definition; `unknown` when the definition isn't an object literal. */
  definition: Keys;
  /** Keys of `schema`: `undefined` when there is none. */
  schema?: Keys;
  handler?: FunctionFact;
}

export interface CallFact {
  /** `call` (communication), `enqueue` (jobs) or `publish` (events). */
  kind: 'call' | 'enqueue' | 'publish';
  /** How the call reads, for messages: `this.call`, `communication.call`. */
  callee: string;
  line: number;
  /** The first argument's text and whether it reads as a context. */
  first?: { text: string; ctx: boolean };
  /** For `call`, the procedure name when it is a literal. */
  procedure?: string;
}

export interface RouteFact {
  method: string;
  path?: string;
  line: number;
  /** Keys of the options' `schema`; undefined when there is none, `unknown` when unreadable. */
  schema?: Keys;
  handler?: FunctionFact;
  /**
   * A route of a class that extends `WebhookController`. Its options take no schema: the signature is
   * checked over the raw body first, so the handler parses the body with Zod itself.
   */
  webhook?: boolean;
  /** For a webhook route: the identifiers the handler passes to a Zod `.parse`/`.safeParse` (or their async forms). */
  parsed?: string[];
}

export interface JobFact {
  line: number;
  definition: Keys;
  handler?: FunctionFact;
}

export interface EventFact {
  name?: string;
  line: number;
  /** Keys of the options; undefined when there are none. */
  options?: Keys;
}

export interface MethodFact {
  className: string;
  name: string;
  line: number;
  params: Param[];
}

export interface SourceFacts {
  procedures: ProcedureFact[];
  calls: CallFact[];
  routes: RouteFact[];
  jobs: JobFact[];
  events: EventFact[];
  subscribers: FunctionFact[];
  /** Public methods of the classes in a `*.service.ts` or `*.repository.ts`. */
  methods: MethodFact[];
  /** A `register…Procedures(...)`/`register…Handlers(...)` imported from a package: it registers names this project can't see. */
  packageRegistrar: boolean;
}

export const emptyFacts = (): SourceFacts => ({
  procedures: [],
  calls: [],
  routes: [],
  jobs: [],
  events: [],
  subscribers: [],
  methods: [],
  packageRegistrar: false,
});

const CTX_NAME = /(?:ctx|context)$/i;
const CTX_ARG = /ctx|context/i;
const CTX_TYPE = /Context\b/;
const ROUTE_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);
const ZOD_PARSE = new Set(['parse', 'safeParse', 'parseAsync', 'safeParseAsync']);
const SERVICE_FILE = /\.(?:service|repository)\.[cm]?[jt]sx?$/;

function scriptKind(t: TypeScript, path: string): ts.ScriptKind {
  if (path.endsWith('.tsx')) return t.ScriptKind.TSX;
  if (path.endsWith('.jsx')) return t.ScriptKind.JSX;
  if (/\.[cm]?js$/.test(path)) return t.ScriptKind.JS;
  return t.ScriptKind.TS;
}

/** Reads the facts of one file. */
export function readFacts(t: TypeScript, path: string, content: string): SourceFacts {
  const sf = t.createSourceFile(path, content, t.ScriptTarget.Latest, true, scriptKind(t, path));
  const facts = emptyFacts();
  const line = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const literal = (node: ts.Node | undefined): string | undefined =>
    node && (t.isStringLiteral(node) || t.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;

  const keysOf = (node: ts.Node | undefined): Keys => {
    if (!node || !t.isObjectLiteralExpression(node)) return 'unknown';
    const keys = new Set<string>();
    for (const p of node.properties) {
      if (t.isSpreadAssignment(p)) return 'unknown';
      const name = p.name && (t.isIdentifier(p.name) || t.isStringLiteral(p.name)) ? p.name.text : undefined;
      if (name) keys.add(name);
    }
    return keys;
  };

  const property = (obj: ts.Node | undefined, key: string): ts.Node | undefined => {
    if (!obj || !t.isObjectLiteralExpression(obj)) return undefined;
    for (const p of obj.properties) {
      if (!p.name || !(t.isIdentifier(p.name) || t.isStringLiteral(p.name)) || p.name.text !== key) continue;
      if (t.isPropertyAssignment(p)) return p.initializer;
      if (t.isMethodDeclaration(p)) return p;
      return p;
    }
    return undefined;
  };

  /** Keys of `obj.schema`, `undefined` when it has none. */
  const schemaOf = (obj: ts.Node | undefined): Keys | undefined => {
    if (!obj || !t.isObjectLiteralExpression(obj)) return 'unknown';
    if (keysOf(obj) === 'unknown') return 'unknown';
    const schema = property(obj, 'schema');
    if (!schema) return undefined;
    return t.isObjectLiteralExpression(schema) ? keysOf(schema) : 'unknown';
  };

  const params = (fn: ts.SignatureDeclarationBase): Param[] =>
    fn.parameters
      .filter((p) => !(t.isIdentifier(p.name) && p.name.text === 'this'))
      .map((p) => {
        const name = t.isIdentifier(p.name) ? p.name.text : undefined;
        const type = p.type?.getText(sf);
        const ctx = type ? CTX_TYPE.test(type) : name !== undefined && CTX_NAME.test(name);
        return { name, type, ctx, line: line(p) };
      });

  const fnFact = (node: ts.Node | undefined): FunctionFact | undefined =>
    node && (t.isArrowFunction(node) || t.isFunctionExpression(node) || t.isMethodDeclaration(node))
      ? { line: line(node), params: params(node) }
      : undefined;

  const unwrap = (node: ts.Expression): ts.Expression => {
    let n = node;
    while (t.isParenthesizedExpression(n) || t.isNonNullExpression(n) || t.isAsExpression(n) || t.isSatisfiesExpression(n)) n = n.expression;
    return n;
  };

  const ctxArg = (arg: ts.Expression | undefined): CallFact['first'] => {
    if (!arg) return undefined;
    const n = unwrap(arg);
    const text = arg.getText(sf);
    if (t.isCallExpression(n) || t.isAwaitExpression(n)) return { text, ctx: true };
    if (t.isIdentifier(n)) return { text, ctx: CTX_ARG.test(n.text) };
    if (t.isPropertyAccessExpression(n)) return { text, ctx: CTX_ARG.test(n.name.text) };
    if (t.isElementAccessExpression(n) || t.isConditionalExpression(n) || t.isBinaryExpression(n)) return { text, ctx: true };
    return { text, ctx: false };
  };

  /** The last name of a receiver: `deps.communication` → `communication`. */
  const tail = (node: ts.Expression): string => {
    const n = unwrap(node);
    if (n.kind === t.SyntaxKind.ThisKeyword) return 'this';
    if (t.isIdentifier(n)) return n.text;
    if (t.isPropertyAccessExpression(n)) return n.name.text;
    return '';
  };

  /** The identifiers a function passes to `.parse`/`.safeParse`/`.parseAsync`/`.safeParseAsync` anywhere in its body. */
  const zodParsed = (fn: ts.Node | undefined): string[] => {
    const out: string[] = [];
    const walk = (n: ts.Node): void => {
      if (t.isCallExpression(n) && t.isPropertyAccessExpression(n.expression) && ZOD_PARSE.has(n.expression.name.text)) {
        const first = n.arguments[0] && unwrap(n.arguments[0]);
        if (first && t.isIdentifier(first)) out.push(first.text);
      }
      t.forEachChild(n, walk);
    };
    if (fn) walk(fn);
    return out;
  };

  const packageImports = new Set<string>();
  for (const stmt of sf.statements) {
    if (!t.isImportDeclaration(stmt) || !t.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text.startsWith('.')) continue;
    const bindings = stmt.importClause?.namedBindings;
    if (bindings && t.isNamedImports(bindings)) for (const el of bindings.elements) packageImports.add(el.name.text);
  }

  const isService = SERVICE_FILE.test(path);

  let webhookClass = false;

  const visit = (node: ts.Node, inClass: boolean): void => {
    if (t.isClassDeclaration(node) || t.isClassExpression(node)) {
      if (isService && node.name) collectMethods(node, node.name.text);
      const base = node.heritageClauses?.find((h) => h.token === t.SyntaxKind.ExtendsKeyword)?.types[0];
      const outer = webhookClass;
      webhookClass = base !== undefined && tail(base.expression) === 'WebhookController';
      t.forEachChild(node, (child) => visit(child, base !== undefined));
      webhookClass = outer;
      return;
    }
    if (t.isCallExpression(node)) onCall(node, inClass);
    t.forEachChild(node, (child) => visit(child, inClass));
  };

  const collectMethods = (cls: ts.ClassLikeDeclaration, className: string): void => {
    for (const m of cls.members) {
      const mods = t.canHaveModifiers(m) ? (t.getModifiers(m) ?? []) : [];
      const hidden = mods.some((x) =>
        [t.SyntaxKind.PrivateKeyword, t.SyntaxKind.ProtectedKeyword, t.SyntaxKind.StaticKeyword].includes(x.kind),
      );
      if (hidden || !m.name || t.isPrivateIdentifier(m.name)) continue;
      const name = t.isIdentifier(m.name) || t.isStringLiteral(m.name) ? m.name.text : m.name.getText(sf);
      let fn: ts.SignatureDeclarationBase | undefined;
      if (t.isMethodDeclaration(m)) fn = m;
      else if (t.isPropertyDeclaration(m) && m.initializer && (t.isArrowFunction(m.initializer) || t.isFunctionExpression(m.initializer))) fn = m.initializer;
      if (fn) facts.methods.push({ className, name, line: line(m), params: params(fn) });
    }
  };

  const onCall = (node: ts.CallExpression, inClass: boolean): void => {
    const callee = node.expression;
    const args = node.arguments;

    if (t.isIdentifier(callee)) {
      const name = callee.text;
      if (name === 'defineProcedure') {
        const def = args[0];
        facts.procedures.push({ line: line(node), via: 'defineProcedure', definition: keysOf(def), schema: schemaOf(def), handler: fnFact(property(def, 'handler')) });
      } else if (name === 'defineJob') {
        const def = args[0];
        facts.jobs.push({ line: line(node), definition: keysOf(def), handler: fnFact(property(def, 'handler')) });
      } else if (name === 'defineEvent') {
        facts.events.push({ name: literal(args[0]), line: line(node), options: args[1] ? keysOf(args[1]) : undefined });
      } else if (/^register\w*(?:Procedures|Handlers)$/.test(name) && packageImports.has(name)) {
        facts.packageRegistrar = true;
      }
      return;
    }
    if (!t.isPropertyAccessExpression(callee)) return;
    const method = callee.name.text;
    const receiver = tail(callee.expression);
    const calleeText = `${receiver === 'this' ? 'this' : callee.expression.getText(sf)}.${method}`;

    if (method === 'register' && args.length >= 2) {
      const name = literal(args[0]);
      const def = args[1];
      const looksLikeProcedure =
        /^comm(?:unication)?$/i.test(receiver) || /communication$/i.test(receiver) || (name !== undefined && property(def, 'handler') !== undefined);
      if (looksLikeProcedure) {
        facts.procedures.push({ name, line: line(node), via: 'register', definition: keysOf(def), schema: schemaOf(def), handler: fnFact(property(def, 'handler')) });
      }
      return;
    }

    if (method === 'call' && ((receiver === 'this' && inClass) || /communication$/i.test(receiver) || /^comm$/i.test(receiver))) {
      facts.calls.push({ kind: 'call', callee: calleeText, line: line(node), first: ctxArg(args[0]), procedure: literal(args[1]) });
      return;
    }
    if ((method === 'enqueue' || method === 'enqueueWithDedup') && /(?:jobs|queue)$/i.test(receiver)) {
      facts.calls.push({ kind: 'enqueue', callee: calleeText, line: line(node), first: ctxArg(args[0]) });
      return;
    }
    if (method === 'publish' && /^(?:events|eventBus)$/i.test(receiver)) {
      facts.calls.push({ kind: 'publish', callee: calleeText, line: line(node), first: ctxArg(args[0]) });
      return;
    }
    if (method === 'subscribe' && /^events$/i.test(receiver)) {
      const handler = fnFact(args[1]);
      if (handler) facts.subscribers.push(handler);
      return;
    }
    if (receiver === 'this' && inClass && ROUTE_METHODS.has(method) && (args.length === 2 || args.length === 3)) {
      const handler = fnFact(args[args.length - 1]);
      if (!handler) return;
      const opts = args.length === 3 ? args[1] : undefined;
      facts.routes.push({
        method: method.toUpperCase(),
        path: literal(args[0]),
        line: line(node),
        schema: opts ? schemaOf(opts) : undefined,
        handler,
        ...(webhookClass ? { webhook: true, parsed: zodParsed(args[args.length - 1]) } : {}),
      });
    }
  };

  visit(sf, false);
  return facts;
}
