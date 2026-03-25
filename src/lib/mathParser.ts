import { compile, derivative, parse } from 'mathjs';

export function evaluateFunction(expr: string, x: number): number {
  const compiled = compile(expr);
  return compiled.evaluate({ x });
}

export function evaluateDerivative(expr: string, x: number): number {
  const node = parse(expr);
  const diff = derivative(node, 'x');
  const compiled = diff.compile();
  return compiled.evaluate({ x });
}

export function getDerivativeString(expr: string): string {
  const node = parse(expr);
  const diff = derivative(node, 'x');
  return diff.toString();
}
