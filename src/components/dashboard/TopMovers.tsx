import { TrendingUp, TrendingDown } from "lucide-react";

const gainers = [
  { name: "TATA MOTORS", price: "₹985.40", change: "+4.2%", sector: "Auto" },
  { name: "ADANI ENT", price: "₹2,847.00", change: "+3.8%", sector: "Infra" },
  { name: "BAJAJ FIN", price: "₹7,126.50", change: "+2.9%", sector: "NBFC" },
  { name: "INFOSYS", price: "₹1,642.30", change: "+2.1%", sector: "IT" },
];

const losers = [
  { name: "HDFC BANK", price: "₹1,598.20", change: "-1.8%", sector: "Banking" },
  { name: "BHARTI AIRTEL", price: "₹1,412.60", change: "-1.5%", sector: "Telecom" },
  { name: "WIPRO", price: "₹487.90", change: "-1.2%", sector: "IT" },
  { name: "SBI", price: "₹628.40", change: "-0.9%", sector: "Banking" },
];

export function TopMovers() {
  return (
    <div className="ai-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Top Gainers & Losers</h3>

      <div className="space-y-2">
        {gainers.map((stock) => (
          <div
            key={stock.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-profit" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm text-foreground">{stock.price}</p>
              <p className="font-mono-data text-xs text-profit">{stock.change}</p>
            </div>
          </div>
        ))}

        <div className="border-t border-white/[0.05] my-2" />

        {losers.map((stock) => (
          <div
            key={stock.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-loss" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm text-foreground">{stock.price}</p>
              <p className="font-mono-data text-xs text-loss">{stock.change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
