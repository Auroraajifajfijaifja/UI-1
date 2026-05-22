import { ClipboardList, FileSearch, PieChart, FileSignature, Wallet } from "lucide-react";

export type ModuleKey = "plan" | "project" | "rate" | "contract" | "settle";

export const MODULES: { key: ModuleKey; title: string; subtitle: string; value: string; trend: string; icon: any; accent: string }[] = [
  { key: "plan", title: "采购计划", subtitle: "本年累计计划", value: "2,560", trend: "+12.4%", icon: ClipboardList, accent: "from-blue-50 to-blue-100 text-blue-600" },
  { key: "project", title: "采购立项", subtitle: "本年立项总数", value: "1,284", trend: "+8.2%", icon: FileSearch, accent: "from-sky-50 to-sky-100 text-sky-600" },
  { key: "rate", title: "采购四率", subtitle: "综合执行评分", value: "92.6%", trend: "+2.1%", icon: PieChart, accent: "from-indigo-50 to-indigo-100 text-indigo-500" },
  { key: "contract", title: "合同", subtitle: "履约中合同数", value: "865", trend: "+5.6%", icon: FileSignature, accent: "from-sky-50 to-sky-100 text-sky-600" },
  { key: "settle", title: "结算", subtitle: "本年结算金额", value: "¥87,256", trend: "+9.8%", icon: Wallet, accent: "from-emerald-50 to-emerald-100 text-emerald-600" },
];

export function TopTabs({ active, onChange }: { active: ModuleKey; onChange: (k: ModuleKey) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {MODULES.map((m) => {
        const Icon = m.icon;
        const isActive = active === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`group relative text-left rounded-xl bg-white p-3.5 border transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
              isActive ? "border-blue-400 bg-gradient-to-br from-blue-50/40 to-white" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.accent} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-700 text-sm truncate">{m.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ${isActive ? "bg-blue-500 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                    {m.trend}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] truncate">{m.subtitle}</div>
              </div>
            </div>
            <div className="mt-2.5 text-slate-900" style={{ fontSize: 20, fontWeight: 600 }}>{m.value}</div>
          </button>
        );
      })}
    </div>
  );
}
