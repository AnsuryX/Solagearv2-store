import { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { TrendingUp } from 'lucide-react';

export default function SavingsCalculator({ productPrice = 0 }) {
  const [monthlyBill, setMonthlyBill] = useState([15000]);
  const [sunHours, setSunHours] = useState([5]);

  const annualSavings = monthlyBill[0] * 12 * 0.85;
  const paybackYears = productPrice > 0 ? Math.ceil(productPrice / annualSavings) : 0;
  const twentyYearSavings = annualSavings * 20 - productPrice;

  return (
    <div className="bg-muted/50 border hairline border-border p-6 rounded-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h4 className="font-heading font-semibold text-sm">Savings Calculator</h4>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Monthly KPLC Bill</span>
            <span className="text-xs font-semibold font-heading">KSh {monthlyBill[0].toLocaleString()}</span>
          </div>
          <Slider
            value={monthlyBill}
            onValueChange={setMonthlyBill}
            min={5000}
            max={1000000}
            step={1000}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Avg. Sun Hours/Day</span>
            <span className="text-xs font-semibold font-heading">{sunHours[0]}h</span>
          </div>
          <Slider
            value={sunHours}
            onValueChange={setSunHours}
            min={3}
            max={8}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t hairline border-border">
          <div className="text-center">
            <p className="font-heading font-bold text-primary text-lg">KSh {Math.round(annualSavings).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-foreground text-lg">{paybackYears}yr</p>
            <p className="text-[10px] text-muted-foreground">Payback Period</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-foreground text-lg">KSh {Math.round(twentyYearSavings).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">20yr Net Savings</p>
          </div>
        </div>
      </div>
    </div>
  );
}