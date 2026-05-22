import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const STAT_PALETTE = [
  { dot: "#3b82f6", chip: "text-blue-600" },
  { dot: "#8b5cf6", chip: "text-violet-600" },
  { dot: "#10b981", chip: "text-emerald-600" },
  { dot: "#f59e0b", chip: "text-amber-600" },
];

function StatCards({ items }: { items: { label: string; value: string; sub?: string }[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-2 py-3 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
      {items.map((s, i) => {
        const palette = STAT_PALETTE[i % STAT_PALETTE.length];
        return (
          <div key={s.label} className="px-5 py-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.dot }} />
              <span className="text-slate-500 text-xs">{s.label}</span>
            </div>
            <div className="mt-2 text-slate-900" style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
            {s.sub && <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

function Card({ title, extra, children }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-800">{title}</div>
        {extra}
      </div>
      {children}
    </div>
  );
}

export function ProjectModule() {
  const data = [
    { m: "1月", v: 32 }, { m: "2月", v: 45 }, { m: "3月", v: 60 }, { m: "4月", v: 52 },
    { m: "5月", v: 78 }, { m: "6月", v: 90 }, { m: "7月", v: 85 }, { m: "8月", v: 102 },
  ];
  const types = [
    { name: "公开招标", v: 480, c: "#3b82f6" },
    { name: "邀请招标", v: 320, c: "#10b981" },
    { name: "竞争性谈判", v: 240, c: "#f59e0b" },
    { name: "单一来源", v: 180, c: "#8b5cf6" },
    { name: "询价", v: 64, c: "#ef4444" },
  ];
  const list = [
    { id: "PRJ-2026-0312", name: "厂区改造项目立项", dept: "工程部", amount: "¥3,200,000", status: "审批中" },
    { id: "PRJ-2026-0311", name: "ERP系统升级采购", dept: "信息部", amount: "¥1,860,000", status: "已立项" },
    { id: "PRJ-2026-0310", name: "原材料长期协议", dept: "供应链", amount: "¥8,420,000", status: "已立项" },
    { id: "PRJ-2026-0309", name: "办公设备集采", dept: "行政部", amount: "¥420,000", status: "草稿" },
  ];
  return (
    <div className="space-y-4">
      <StatCards items={[
        { label: "立项数量", value: "1,284", sub: "本年累计" },
        { label: "立项金额", value: "¥86.4M", sub: "申报金额" },
        { label: "审批通过率", value: "94.2%", sub: "近 30 天" },
        { label: "平均审批时长", value: "3.6d", sub: "工作日" },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="立项数量趋势">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card title="采购方式分布">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={types} dataKey="v" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {types.map((t) => <Cell key={`cell-${t.name}`} fill={t.c} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            {types.map((t) => (
              <span key={t.name} className="flex items-center gap-1"><i className="w-2 h-2 rounded-full" style={{ background: t.c }} />{t.name}</span>
            ))}
          </div>
        </Card>
      </div>
      <Card title="近期立项" extra={<button className="text-xs text-blue-500 hover:underline">查看全部 →</button>}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100">
            <th className="py-2 font-normal">立项编号</th><th className="py-2 font-normal">项目名称</th>
            <th className="py-2 font-normal">部门</th><th className="py-2 font-normal text-right">金额</th>
            <th className="py-2 font-normal text-right">状态</th>
          </tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30">
                <td className="py-3 text-slate-500">{r.id}</td>
                <td className="py-3 text-slate-800">{r.name}</td>
                <td className="py-3 text-slate-600">{r.dept}</td>
                <td className="py-3 text-right text-slate-900">{r.amount}</td>
                <td className="py-3 text-right"><span className={`px-2 py-1 rounded-md text-xs ${
                  r.status === "已立项" ? "bg-emerald-50 text-emerald-600" :
                  r.status === "审批中" ? "bg-blue-50 text-blue-600" :
                  "bg-slate-100 text-slate-500"
                }`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function RateModule() {
  const rates = [
    { name: "计划达成率", v: 92.6, color: "#3b82f6" },
    { name: "招标完成率", v: 88.3, color: "#8b5cf6" },
    { name: "合同签订率", v: 95.1, color: "#10b981" },
    { name: "结算及时率", v: 86.4, color: "#f59e0b" },
  ];
  const trend = [
    { m: "1月", a: 88, b: 82, c: 91, d: 80 },
    { m: "2月", a: 89, b: 84, c: 92, d: 82 },
    { m: "3月", a: 90, b: 85, c: 93, d: 84 },
    { m: "4月", a: 91, b: 86, c: 94, d: 85 },
    { m: "5月", a: 92.6, b: 88.3, c: 95.1, d: 86.4 },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-100 px-2 py-3 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
        {rates.map((r) => (
          <div key={r.name} className="px-5 py-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              <span className="text-slate-500 text-xs">{r.name}</span>
            </div>
            <div className="mt-2" style={{ fontSize: 24, fontWeight: 600, color: r.color }}>{r.v}%</div>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.color }} />
            </div>
          </div>
        ))}
      </div>
      <Card title="四率月度趋势">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Line type="monotone" dataKey="a" stroke="#3b82f6" strokeWidth={2} name="计划达成" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="b" stroke="#8b5cf6" strokeWidth={2} name="招标完成" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="c" stroke="#10b981" strokeWidth={2} name="合同签订" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="d" stroke="#f59e0b" strokeWidth={2} name="结算及时" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export function ContractModule() {
  const data = [
    { m: "1月", v: 42 }, { m: "2月", v: 56 }, { m: "3月", v: 78 }, { m: "4月", v: 65 },
    { m: "5月", v: 90 }, { m: "6月", v: 110 }, { m: "7月", v: 95 }, { m: "8月", v: 128 },
  ];
  const list = [
    { id: "HT-20260512-001", party: "上海东方机械有限公司", amount: "¥1,260,000", date: "2026-05-08", status: "履约中" },
    { id: "HT-20260510-008", party: "北京华信电子科技", amount: "¥860,000", date: "2026-05-06", status: "已签订" },
    { id: "HT-20260508-014", party: "深圳前海物流集团", amount: "¥3,420,000", date: "2026-05-03", status: "履约中" },
    { id: "HT-20260505-002", party: "杭州智能制造有限公司", amount: "¥520,000", date: "2026-04-29", status: "已结清" },
  ];
  return (
    <div className="space-y-4">
      <StatCards items={[
        { label: "合同总数", value: "865", sub: "履约中 412" },
        { label: "合同总额", value: "¥215.8M", sub: "本年签订" },
        { label: "履约率", value: "93.7%", sub: "按时履约" },
        { label: "到期预警", value: "12", sub: "30 天内" },
      ]} />
      <Card title="月度签订金额（万元）">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="v" radius={[8, 8, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="近期合同">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100">
            <th className="py-2 font-normal">合同编号</th><th className="py-2 font-normal">乙方</th>
            <th className="py-2 font-normal text-right">金额</th><th className="py-2 font-normal">签订日期</th>
            <th className="py-2 font-normal text-right">状态</th>
          </tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/30">
                <td className="py-3 text-slate-500">{r.id}</td>
                <td className="py-3 text-slate-800">{r.party}</td>
                <td className="py-3 text-right text-slate-900">{r.amount}</td>
                <td className="py-3 text-slate-600">{r.date}</td>
                <td className="py-3 text-right"><span className={`px-2 py-1 rounded-md text-xs ${
                  r.status === "履约中" ? "bg-sky-50 text-sky-600" :
                  r.status === "已签订" ? "bg-blue-50 text-blue-600" :
                  "bg-emerald-50 text-emerald-600"
                }`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function SettleModule() {
  const data = [
    { m: "1月", a: 620, b: 580 }, { m: "2月", a: 720, b: 660 }, { m: "3月", a: 880, b: 820 },
    { m: "4月", a: 760, b: 700 }, { m: "5月", a: 920, b: 880 }, { m: "6月", a: 1080, b: 1010 },
  ];
  const list = [
    { id: "JS-20260511-007", party: "上海东方机械有限公司", amount: "¥420,000", paid: "¥420,000", status: "已支付" },
    { id: "JS-20260510-021", party: "北京华信电子科技", amount: "¥260,000", paid: "¥130,000", status: "部分支付" },
    { id: "JS-20260508-013", party: "深圳前海物流集团", amount: "¥1,120,000", paid: "¥0", status: "待支付" },
  ];
  return (
    <div className="space-y-4">
      <StatCards items={[
        { label: "结算金额", value: "¥87.26M", sub: "本年累计" },
        { label: "已支付", value: "¥72.40M", sub: "占 82.9%" },
        { label: "应付未付", value: "¥14.86M", sub: "供应商 86 家" },
        { label: "平均结算周期", value: "18.2d", sub: "环比 -1.5d" },
      ]} />
      <Card title="结算 vs 支付（万元）">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="a" radius={[8, 8, 0, 0]} fill="#3b82f6" name="结算" />
            <Bar dataKey="b" radius={[8, 8, 0, 0]} fill="#10b981" name="支付" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="结算明细">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-100">
            <th className="py-2 font-normal">结算单号</th><th className="py-2 font-normal">供应商</th>
            <th className="py-2 font-normal text-right">结算金额</th>
            <th className="py-2 font-normal text-right">已支付</th>
            <th className="py-2 font-normal text-right">状态</th>
          </tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-emerald-50/30">
                <td className="py-3 text-slate-500">{r.id}</td>
                <td className="py-3 text-slate-800">{r.party}</td>
                <td className="py-3 text-right text-slate-900">{r.amount}</td>
                <td className="py-3 text-right text-slate-600">{r.paid}</td>
                <td className="py-3 text-right"><span className={`px-2 py-1 rounded-md text-xs ${
                  r.status === "已支付" ? "bg-emerald-50 text-emerald-600" :
                  r.status === "部分支付" ? "bg-blue-50 text-blue-600" :
                  "bg-slate-100 text-slate-500"
                }`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
