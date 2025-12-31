import { CreditCard, Download } from "lucide-react";

export default function BillingPage() {
  const invoices = [
    {
      id: "INV-2024-001",
      date: "Dec 01, 2024",
      amount: "$0.00",
      status: "Paid",
    },
    {
      id: "INV-2024-002",
      date: "Nov 01, 2024",
      amount: "$0.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black text-white rounded-xl p-8 relative overflow-hidden shadow-lg border border-zinc-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-1">
                  Current Plan
                </div>
                <h2 className="text-3xl font-bold">Starter Free</h2>
              </div>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                Active
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Daily Requests</span>
                <span className="font-mono">12 / 50</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[24%]"></div>
              </div>

              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Storage Used</span>
                <span className="font-mono">45MB / 1GB</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[4%]"></div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="bg-orange-500 text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors">
                Upgrade Plan
              </button>
              <button className="text-zinc-400 hover:text-white text-sm font-medium px-4 py-2.5 transition-colors">
                Manage Payment Method
              </button>
            </div>
          </div>
        </div>

        {/* Next Invoice Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
            <CreditCard size={24} />
          </div>
          <div className="text-zinc-500 text-sm font-medium mb-1">
            Next Invoice
          </div>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <div className="text-xs text-zinc-500 mt-1">Due on Jan 1, 2025</div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="font-bold text-white">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-800/50 text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{inv.id}</td>
                  <td className="px-6 py-4 text-zinc-400">{inv.date}</td>
                  <td className="px-6 py-4 text-white">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-900/30 text-green-500 px-2 py-1 rounded-full text-xs font-bold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
