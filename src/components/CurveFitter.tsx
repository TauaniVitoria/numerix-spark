import { useState } from 'react';
import { linearRegression, CurveResult } from '@/lib/curveFitting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { AlertCircle, Info, Plus, Trash2 } from 'lucide-react';

export default function CurveFitter() {
  const [points, setPoints] = useState<{ x: string; y: string }[]>([
    { x: '1', y: '2.1' },
    { x: '2', y: '3.9' },
    { x: '3', y: '6.2' },
    { x: '4', y: '7.8' },
    { x: '5', y: '10.1' },
  ]);
  const [result, setResult] = useState<CurveResult | null>(null);
  const [error, setError] = useState('');

  const addPoint = () => setPoints([...points, { x: '', y: '' }]);
  const removePoint = (i: number) => setPoints(points.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, field: 'x' | 'y', v: string) => {
    const p = [...points];
    p[i] = { ...p[i], [field]: v };
    setPoints(p);
  };

  const solve = () => {
    setError('');
    setResult(null);
    try {
      const parsed = points.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
      if (parsed.some(p => isNaN(p.x) || isNaN(p.y))) {
        throw new Error('Todos os pontos devem ser números válidos.');
      }
      setResult(linearRegression(parsed));
    } catch (e: any) {
      setError(e.message || 'Erro');
    }
  };

  const chartData = result ? (() => {
    const parsed = points.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    const xs = parsed.map(p => p.x);
    const min = Math.min(...xs) - 1;
    const max = Math.max(...xs) + 1;
    const linePoints = [];
    for (let i = 0; i <= 50; i++) {
      const xv = min + (max - min) * i / 50;
      linePoints.push({ x: +xv.toFixed(4), line: +(result.coefficients.a * xv + result.coefficients.b).toFixed(4) });
    }
    return { scatter: parsed, line: linePoints };
  })() : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ajuste de Curvas</h2>
        <p className="text-muted-foreground text-sm mt-1">Encontre a melhor reta que se ajusta aos dados pelo método dos mínimos quadrados.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <CardDescription className="text-sm">
              A regressão linear minimiza a soma dos quadrados dos resíduos para encontrar a reta y = ax + b que melhor se ajusta aos dados.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-xs font-medium">Pontos (x, y)</Label>
          <div className="space-y-2 max-h-60 overflow-auto">
            {points.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                <Input value={p.x} onChange={e => updatePoint(i, 'x', e.target.value)} placeholder="x" className="w-24 h-8 text-xs font-mono" />
                <Input value={p.y} onChange={e => updatePoint(i, 'y', e.target.value)} placeholder="y" className="w-24 h-8 text-xs font-mono" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removePoint(i)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addPoint}>
            <Plus size={14} className="mr-1" /> Adicionar Ponto
          </Button>

          <div className="pt-2">
            <Button onClick={solve}>Calcular Regressão</Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resultado — {result.method}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Equação</p>
                  <p className="font-mono font-bold text-primary">{result.equation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coeficiente a</p>
                  <p className="font-mono font-bold">{result.coefficients.a.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">R²</p>
                  <p className="font-mono font-bold">{result.rSquared.toFixed(6)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {chartData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gráfico de Ajuste</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ fontSize: 12, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Scatter name="Dados" data={chartData.scatter} fill="hsl(var(--primary))" />
                    <Line data={chartData.line} type="monotone" dataKey="line" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
