export class AssertionError extends Error {
  override name = 'AssertionError';
}

/** Make an assertion, error will be thrown if `expr` does not have truthy value. */
export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) throw new AssertionError(msg);
}
