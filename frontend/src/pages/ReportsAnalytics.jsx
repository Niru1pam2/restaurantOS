import { useState } from 'react';
import Layout from '../components/Layout';

const SUMMARY_METRICS = [
  { label: 'Total Revenue', value: '$24,850.00', change: '+14.2%', isPositive: true },
  { label: 'Cost of Goods Sold (COGS)', value: '$7,210.00', change: '-3.1%', isPositive: true },
  { label: 'Net Profit Margin', value: '38.5%', change: '+4.5%', isPositive: true },
  { label: 'Food Waste Rate', value: '2.4%', change: '-0.8%', isPositive: true }
];

export default function ReportsAnalytics() {
  const [period, setPeriod] = useState('This Month');
  return (
    <Layout>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Financial Analytics</h1>
            <p className="text-slate-400 text-sm">Profitability metrics, COGS analysis, inventory valuation & waste reports</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm font-semibold">
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_METRICS.map((m, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold">{m.label}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">{m.value}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${m.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{m.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Analytical Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Top 5 Most Profitable Menu Items</h3>
            <div className="space-y-3">
              {[
                { name: 'Truffle Mushroom Risotto', margin: '74% Profit Margin', rev: '$4,280' },
                { name: 'Wagyu Beef Burger', margin: '68% Profit Margin', rev: '$6,120' },
                { name: 'Artisanal Woodfired Pizza', margin: '81% Profit Margin', rev: '$3,950' },
                { name: 'Fresh Lobster Pasta', margin: '62% Profit Margin', rev: '$5,400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">{item.margin}</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-indigo-400">{item.rev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Cost Breakdown (COGS)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Meat & Seafood</span>
                  <span className="font-mono text-white">42% ($3,028)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-full w-[42%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Fresh Produce & Herbs</span>
                  <span className="font-mono text-white">25% ($1,802)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full w-[25%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Dairy & Eggs</span>
                  <span className="font-mono text-white">18% ($1,297)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full w-[18%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Dry Goods & Pantry</span>
                  <span className="font-mono text-white">15% ($1,083)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-purple-500 h-full w-[15%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
