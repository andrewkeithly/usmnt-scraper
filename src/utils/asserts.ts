export class AssertionError extends Error {
  name = 'AssertionError';
  constructor(message: string) {
    super(message);
  }
}

/** Make an assertion, error will be thrown if `expr` does not have truthy value. */
export function assert(expr: unknown, msg = ''): asserts expr {
  if (!expr) throw new AssertionError(msg);
}
