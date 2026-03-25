import { evaluateFunction, evaluateDerivative } from './mathParser';

export interface Iteration {
  n: number;
  [key: string]: number | string;
}

export interface RootResult {
  root: number;
  iterations: Iteration[];
  converged: boolean;
  method: string;
}

export function bisection(expr: string, a: number, b: number, tol: number, maxIter: number): RootResult {
  const iterations: Iteration[] = [];
  let fa = evaluateFunction(expr, a);

  if (fa * evaluateFunction(expr, b) > 0) {
    throw new Error('f(a) e f(b) devem ter sinais opostos.');
  }

  let mid = a;
  for (let i = 1; i <= maxIter; i++) {
    mid = (a + b) / 2;
    const fmid = evaluateFunction(expr, mid);
    iterations.push({ n: i, a: +a.toFixed(10), b: +b.toFixed(10), mid: +mid.toFixed(10), 'f(mid)': +fmid.toFixed(10), erro: +((b - a) / 2).toFixed(10) });

    if (Math.abs(fmid) < tol || (b - a) / 2 < tol) {
      return { root: mid, iterations, converged: true, method: 'Bisseção' };
    }

    if (fa * fmid < 0) {
      b = mid;
    } else {
      a = mid;
      fa = fmid;
    }
  }
  return { root: mid, iterations, converged: false, method: 'Bisseção' };
}

export function fixedPoint(gExpr: string, x0: number, tol: number, maxIter: number): RootResult {
  const iterations: Iteration[] = [];
  let x = x0;

  for (let i = 1; i <= maxIter; i++) {
    const xNew = evaluateFunction(gExpr, x);
    const error = Math.abs(xNew - x);
    iterations.push({ n: i, x: +x.toFixed(10), 'g(x)': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Ponto Fixo' };
    }
    x = xNew;
  }
  return { root: x, iterations, converged: false, method: 'Ponto Fixo' };
}

export function newtonRaphson(expr: string, x0: number, tol: number, maxIter: number): RootResult {
  const iterations: Iteration[] = [];
  let x = x0;

  for (let i = 1; i <= maxIter; i++) {
    const fx = evaluateFunction(expr, x);
    const fpx = evaluateDerivative(expr, x);

    if (Math.abs(fpx) < 1e-14) {
      throw new Error('Derivada muito próxima de zero. O método divergiu.');
    }

    const xNew = x - fx / fpx;
    const error = Math.abs(xNew - x);
    iterations.push({ n: i, x: +x.toFixed(10), 'f(x)': +fx.toFixed(10), "f'(x)": +fpx.toFixed(10), 'x_novo': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Newton-Raphson' };
    }
    x = xNew;
  }
  return { root: x, iterations, converged: false, method: 'Newton-Raphson' };
}

export function secant(expr: string, x0: number, x1: number, tol: number, maxIter: number): RootResult {
  const iterations: Iteration[] = [];
  let xPrev = x0;
  let xCurr = x1;

  for (let i = 1; i <= maxIter; i++) {
    const fPrev = evaluateFunction(expr, xPrev);
    const fCurr = evaluateFunction(expr, xCurr);

    if (Math.abs(fCurr - fPrev) < 1e-14) {
      throw new Error('Divisão por zero no método das secantes.');
    }

    const xNew = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);
    const error = Math.abs(xNew - xCurr);
    iterations.push({ n: i, 'x_(n-1)': +xPrev.toFixed(10), 'x_n': +xCurr.toFixed(10), 'f(x_n)': +fCurr.toFixed(10), 'x_(n+1)': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Secantes' };
    }
    xPrev = xCurr;
    xCurr = xNew;
  }
  return { root: xCurr, iterations, converged: false, method: 'Secantes' };
}
