import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateEmi, formatINRCompact, formatCurrency } from '@/lib/utils';

interface EmiCalculatorProps {
  /** Initial / pre-filled vehicle price. */
  defaultPrice?: number;
  /** Compact layout for embedding inside the detail page sidebar. */
  compact?: boolean;
  className?: string;
}

/**
 * Simple car-loan EMI calculator.
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1); r = annual/1200, n = months.
 */
export function EmiCalculator({ defaultPrice = 500000, compact, className }: EmiCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPayment, setDownPayment] = useState(Math.round(defaultPrice * 0.2));
  const [rate, setRate] = useState(9.5);
  const [months, setMonths] = useState(60);

  const { emi, principal, totalInterest, totalPayable } = useMemo(() => {
    const p = Math.max(price - downPayment, 0);
    const monthly = calculateEmi(p, rate, months);
    const total = monthly * months;
    return {
      emi: monthly,
      principal: p,
      totalInterest: Math.max(total - p, 0),
      totalPayable: total,
    };
  }, [price, downPayment, rate, months]);

  const interestShare = totalPayable > 0 ? Math.round((totalInterest / totalPayable) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>EMI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="emi-price">Vehicle price</Label>
          <Input
            id="emi-price"
            type="number"
            value={price}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">{formatINRCompact(price)}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-dp">Down payment</Label>
          <Input
            id="emi-dp"
            type="number"
            value={downPayment}
            min={0}
            max={price}
            onChange={(e) => setDownPayment(Math.min(Number(e.target.value) || 0, price))}
          />
          <input
            type="range"
            min={0}
            max={price}
            step={5000}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Down payment"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-rate">Interest rate (% p.a.)</Label>
          <Input
            id="emi-rate"
            type="number"
            step={0.1}
            value={rate}
            min={0}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emi-tenure">Tenure (months)</Label>
          <Input
            id="emi-tenure"
            type="number"
            value={months}
            min={6}
            max={96}
            onChange={(e) => setMonths(Number(e.target.value) || 0)}
          />
        </div>

        <div className="rounded-lg bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">Monthly EMI</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(emi)}</p>

          {!compact && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan amount</span>
                <span className="font-medium">{formatCurrency(principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-medium">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total payable</span>
                <span className="font-medium">{formatCurrency(totalPayable)}</span>
              </div>

              <div className="mt-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="bg-primary" style={{ width: `${100 - interestShare}%` }} />
                  <div className="bg-amber-400" style={{ width: `${interestShare}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Principal ({100 - interestShare}%)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Interest ({interestShare}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          * Indicative figures only. Actual EMI depends on the lender’s terms, processing fees,
          insurance and your credit profile.
        </p>
      </CardContent>
    </Card>
  );
}

export default EmiCalculator;
