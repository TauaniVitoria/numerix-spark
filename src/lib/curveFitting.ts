export interface CurveResult {
  equation: string;
  coefficients: { a: number; b: number };
  rSquared: number;
  method: string;
}

export function linearRegression(points: { x: number; y: number }[]): CurveResult {
  const n = points.length;
  if (n < 2) throw new Error('São necessários pelo menos 2 pontos.');

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) throw new Error('Pontos colineares no eixo x.');

  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - (a * p.x + b)) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  const sign = b >= 0 ? '+' : '-';
  const equation = `y = ${a.toFixed(6)}x ${sign} ${Math.abs(b).toFixed(6)}`;

  return { equation, coefficients: { a, b }, rSquared, method: 'Regressão Linear (Mínimos Quadrados)' };
}
