import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trend = [
  { m: "1月", plan: 120, actual: 108, target: 150 },
  { m: "2月", plan: 180, actual: 165, target: 180 },
  { m: "3月", plan: 220, actual: 210, target: 220 },
  { m: "4月", plan: 200, actual: 188, target: 220 },
  { m: "5月", plan: 280, actual: 265, target: 260 },
  { m: "6月", plan: 320, actual: 298, target: 300 },
  { m: "7月", plan: 290, actual: 280, target: 320 },
  { m: "8月", plan: 360, actual: 348, target: 340 },
  { m: "9月", plan: 410, actual: 392, target: 380 },
  { m: "10月", plan: 380, actual: 370, target: 400 },
  { m: "11月", plan: 450, actual: 432, target: 420 },
  { m: "12月", plan: 520, actual: 498, target: 460 },
];
const status = [
  { name: "草稿", v: 320, color: "#94a3b8", pct: 12.5 },
  { name: "审批中", v: 580, color: "#f59e0b", pct: 22.7 },
  { name: "已审批", v: 1240, color: "#10b981", pct: 48.4 },
  { name: "已驳回", v: 120, color: "#ef4444", pct: 4.7 },
  { name: "已关闭", v: 300, color: "#8b5cf6", pct: 11.7 },
];
const totalStatus = status.reduce((a, b) => a + b.v, 0);
const materials = [
  { code: "MT-1001", name: "钢材-Q235B", qty: 1280, amount: 1280000, status: "进行中" },
  { code: "MT-1042", name: "电缆-YJV22", qty: 560, amount: 845000, status: "已完成" },
  { code: "MT-1108", name: "水泥-P.O 42.5", qty: 3200, amount: 612000, status: "进行中" },
  { code: "MT-1233", name: "螺栓-M16", qty: 9800, amount: 156000, status: "待启动" },
  { code: "MT-1345", name: "PVC管-DN50", qty: 1500, amount: 98000, status: "已完成" },
];
const stats = [
  { label: "计划数量", value: "2,560", sub: "本年累计", trend: "+12.4%", up: true },
  { label: "计划金额", value: "¥128.6M", sub: "含税总额", trend: "+8.6%", up: true },
  { label: "执行率", value: "86.4%", sub: "计划/实际", trend: "+3.1%", up: true },
  { label: "平均周期", value: "12.5d", sub: "立项→执行", trend: "-1.2d", up: true },
];

const fmt = (n: number) => "¥" + n.toLocaleString();

export function PlanModule() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-100 px-2 py-3 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
        {stats.map((s, i) => {
          const palette = [
            { dot: "#3b82f6", chip: "text-blue-600" },
            { dot: "#8b5cf6", chip: "text-violet-600" },
            { dot: "#10b981", chip: "text-emerald-600" },
            { dot: "#f59e0b", chip: "text-amber-600" },
          ][i];
          return (
            <div key={s.label} className="px-5 py-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.dot }} />
                <span className="text-slate-500 text-xs">{s.label}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-slate-900" style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</span>
                <span className={`text-[11px] ${palette.chip}`}>{s.trend}</span>
              </div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-800">计划金额趋势</div>
              <div className="text-xs text-slate-400 mt-0.5">单位：万元 · 计划 vs 实际 vs 目标</div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-blue-500 text-white">月度</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100">季度</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100">年度</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-1.5 rounded-sm bg-[#3b82f6]" />计划金额</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-1.5 rounded-sm bg-[#10b981]" />实际执行</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-[#f59e0b]" />目标线</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="plan" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradPlan)" isAnimationActive={false} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <ReferenceLine y={300} stroke="#cbd5e1" strokeDasharray="2 2" label={{ value: "均值线", position: "right", fill: "#94a3b8", fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-800">业务过程状态</div>
              <div className="text-xs text-slate-400 mt-0.5">共 {totalStatus.toLocaleString()} 单</div>
            </div>
          </div>
          <div className="space-y-3">
            {status.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <i className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </div>
                  <div className="text-slate-500">{s.v.toLocaleString()} <span className="text-slate-400">· {s.pct}%</span></div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct * 2}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">完结率</span>
            <span className="text-slate-700">60.1%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="text-slate-800 mb-4">类别金额占比</div>
          <div className="space-y-3">
            {status.map((s) => {
              const maxV = Math.max(...status.map((x) => x.v));
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-12 flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.v / maxV) * 100}%`, background: s.color }} />
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right flex-shrink-0">{s.v.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-slate-800">物料计划明细</div>
              <div className="text-xs text-slate-400 mt-0.5">按金额排序前 5 项</div>
            </div>
            <button className="text-xs text-blue-500 hover:underline">查看全部 →</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="py-2 font-normal">物料编码</th>
                <th className="py-2 font-normal">物料名称</th>
                <th className="py-2 font-normal text-right">数量</th>
                <th className="py-2 font-normal text-right">金额</th>
                <th className="py-2 font-normal text-right">状态</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((r) => (
                <tr key={r.code} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30">
                  <td className="py-2.5 text-slate-500">{r.code}</td>
                  <td className="py-2.5 text-slate-800">{r.name}</td>
                  <td className="py-2.5 text-right text-slate-600">{r.qty.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-900">{fmt(r.amount)}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      r.status === "已完成" ? "bg-emerald-50 text-emerald-600" :
                      r.status === "进行中" ? "bg-blue-50 text-blue-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>{r.status}</span>
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