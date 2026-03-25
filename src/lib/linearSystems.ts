export interface LinearResult {
  solution: number[];
  steps?: string[];
  iterations?: { n: number; x: number[] }[];
  method: string;
}

function cloneMatrix(m: number[][]): number[][] {
  return m.map(r => [...r]);
}

export function gaussElimination(A: number[][], b: number[]): LinearResult {
  const n = A.length;
  const aug = A.map((row, i) => [...row, b[i]]);
  const steps: string[] = [];

  for (let k = 0; k < n; k++) {
    // Pivoteamento parcial
    let maxVal = Math.abs(aug[k][k]);
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > maxVal) {
        maxVal = Math.abs(aug[i][k]);
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];
      steps.push(`Troca linha ${k + 1} ↔ linha ${maxRow + 1}`);
    }

    if (Math.abs(aug[k][k]) < 1e-12) throw new Error('Sistema singular ou mal condicionado.');

    for (let i = k + 1; i < n; i++) {
      const factor = aug[i][k] / aug[k][k];
      steps.push(`L${i + 1} = L${i + 1} - (${factor.toFixed(4)}) * L${k + 1}`);
      for (let j = k; j <= n; j++) {
        aug[i][j] -= factor * aug[k][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += aug[i][j] * x[j];
    x[i] = (aug[i][n] - sum) / aug[i][i];
  }

  return { solution: x, steps, method: 'Eliminação de Gauss' };
}

export function luDecomposition(A: number[][], b: number[]): LinearResult {
  const n = A.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const U: number[][] = cloneMatrix(A);
  const steps: string[] = [];

  for (let i = 0; i < n; i++) L[i][i] = 1;

  for (let k = 0; k < n; k++) {
    if (Math.abs(U[k][k]) < 1e-12) throw new Error('Pivô zero encontrado na fatoração LU.');
    for (let i = k + 1; i < n; i++) {
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor;
      for (let j = k; j < n; j++) {
        U[i][j] -= factor * U[k][j];
      }
    }
  }

  steps.push('Matriz L: ' + L.map(r => '[' + r.map(v => v.toFixed(4)).join(', ') + ']').join(' | '));
  steps.push('Matriz U: ' + U.map(r => '[' + r.map(v => v.toFixed(4)).join(', ') + ']').join(' | '));

  // Ly = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
    y[i] = b[i] - sum;
  }

  // Ux = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
    x[i] = (y[i] - sum) / U[i][i];
  }

  return { solution: x, steps, method: 'Fatoração LU' };
}

export function jacobi(A: number[][], b: number[], tol: number, maxIter: number): LinearResult {
  const n = A.length;
  let x = new Array(n).fill(0);
  const iterations: { n: number; x: number[] }[] = [];

  for (let iter = 1; iter <= maxIter; iter++) {
    const xNew = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      xNew[i] = (b[i] - sum) / A[i][i];
    }

    iterations.push({ n: iter, x: xNew.map(v => +v.toFixed(8)) });

    const error = Math.max(...xNew.map((v, i) => Math.abs(v - x[i])));
    if (error < tol) {
      return { solution: xNew, iterations, method: 'Jacobi' };
    }
    x = xNew;
  }
  return { solution: x, iterations, method: 'Jacobi' };
}

export function gaussSeidel(A: number[][], b: number[], tol: number, maxIter: number): LinearResult {
  const n = A.length;
  const x = new Array(n).fill(0);
  const iterations: { n: number; x: number[] }[] = [];

  for (let iter = 1; iter <= maxIter; iter++) {
    const xOld = [...x];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }

    iterations.push({ n: iter, x: x.map(v => +v.toFixed(8)) });

    const error = Math.max(...x.map((v, i) => Math.abs(v - xOld[i])));
    if (error < tol) {
      return { solution: [...x], iterations, method: 'Gauss-Seidel' };
    }
  }
  return { solution: [...x], iterations, method: 'Gauss-Seidel' };
}
