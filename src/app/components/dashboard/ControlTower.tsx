import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  AlertTriangle, Sparkles, Building2,
  Users, Wrench, GraduationCap, Cloud, Store, Recycle, Truck, Globe, Plane,
  ArrowUpRight, Activity, X,
} from "lucide-react";

const COLORS = {
  bg: "#061325",
  panel: "rgba(14,32,58,0.72)",
  border: "rgba(64,158,255,0.22)",
  borderStrong: "rgba(64,158,255,0.45)",
  text: "#cfe1ff",
  textDim: "#7c93b3",
  cyan: "#3FA9F5",
  cyanSoft: "#5ec6ff",
  orange: "#FF9F43",
  orangeSoft: "#ffc278",
  red: "#FF5A5F",
  green: "#27D6A5",
};

const purchaseStats = [
  { label: "采购计划", value: "¥218.6", unit: "亿", growth: "+12.4%" },
  { label: "采购寻源", value: "¥186.4", unit: "亿", growth: "+8.6%" },
  { label: "采购合同", value: "¥162.8", unit: "亿", growth: "+9.2%" },
  { label: "采购结算", value: "¥128.5", unit: "亿", growth: "+5.7%" },
];

const demandForecast = [
  { name: "中铁建华北公司", v: 920 },
  { name: "中铁建华东公司", v: 880 },
  { name: "中铁建华南公司", v: 760 },
  { name: "中铁建西南公司", v: 680 },
  { name: "中铁建西北公司", v: 540 },
  { name: "中铁建东北公司", v: 420 },
];

const ratesData = [
  { name: "公开采购率", value: 96, color: "#3FA9F5" },
  { name: "寻源集中采购率", value: 97, color: "#FF9F43" },
  { name: "寻源合同备案率", value: 98, color: "#27D6A5" },
];

const supplierCategories = [
  { name: "物资类", value: 38, color: "#3FA9F5" },
  { name: "设备类", value: 18, color: "#5ec6ff" },
  { name: "办公生活类", value: 8, color: "#27D6A5" },
  { name: "服务类", value: 16, color: "#FF9F43" },
  { name: "分包类", value: 14, color: "#ffc278" },
  { name: "信息化类", value: 6, color: "#8b5cf6" },
];

const topMetrics = [
  { icon: Building2, value: "17,000+", label: "项目部" },
  { icon: Users, value: "300,000+", label: "供应商" },
  { icon: Wrench, value: "202,294", label: "设备数量" },
  { icon: GraduationCap, value: "57,187", label: "评标专家" },
];

const quickEntries = [
  { icon: Cloud, name: "铁建云租", amount: "¥86.2亿" },
  { icon: Store, name: "铁建商城", amount: "¥124.8亿" },
  { icon: Recycle, name: "循环物资", amount: "¥42.6亿" },
  { icon: Truck, name: "智慧物流", amount: "¥68.4亿" },
  { icon: Globe, name: "海外采购", amount: "¥38.9亿" },
  { icon: Plane, name: "智能商旅", amount: "¥12.6亿" },
];

// 节点（经纬度）
type Node = {
  name: string; coord: [number, number];
  type: "project" | "core" | "risk";
  region: string; suppliers: number; amount: string;
};
const NODES: Node[] = [
  { name: "济南西站", coord: [116.99, 36.65], type: "core", region: "重大项目·山东", suppliers: 48, amount: "128亿" },
  { name: "北京枢纽", coord: [116.40, 39.90], type: "project", region: "重点项目·北京", suppliers: 36, amount: "86亿" },
  { name: "成渝中线", coord: [104.06, 30.67], type: "core", region: "重大项目·四川", suppliers: 42, amount: "112亿" },
  { name: "粤港澳枢纽", coord: [113.27, 23.13], type: "project", region: "区域项目·广东", suppliers: 28, amount: "64亿" },
  { name: "西安地铁", coord: [108.94, 34.34], type: "project", region: "城轨·陕西", suppliers: 22, amount: "48亿" },
  { name: "雄安新区", coord: [116.07, 38.97], type: "core", region: "重大项目·河北", suppliers: 56, amount: "186亿" },
  { name: "乌鲁木齐", coord: [87.62, 43.83], type: "project", region: "供应基地·新疆", suppliers: 18, amount: "32亿" },
  { name: "昆明高速", coord: [102.83, 24.88], type: "project", region: "供应基地·云南", suppliers: 14, amount: "26亿" },
  { name: "天津贸易", coord: [117.20, 39.13], type: "risk", region: "风险节点·天津", suppliers: 0, amount: "—" },
  { name: "郑州物流", coord: [113.65, 34.76], type: "risk", region: "风险节点·河南", suppliers: 0, amount: "—" },
  { name: "上海钢材", coord: [121.47, 31.23], type: "core", region: "核心供应商·上海", suppliers: 62, amount: "210亿" },
  { name: "武汉水泥", coord: [114.30, 30.59], type: "project", region: "供应基地·湖北", suppliers: 24, amount: "52亿" },
  { name: "沈阳设备", coord: [123.43, 41.80], type: "project", region: "区域项目·辽宁", suppliers: 19, amount: "38亿" },
  { name: "兰州西站", coord: [103.83, 36.06], type: "project", region: "区域项目·甘肃", suppliers: 16, amount: "28亿" },
  { name: "拉萨基地", coord: [91.13, 29.65], type: "project", region: "供应基地·西藏", suppliers: 11, amount: "18亿" },
  { name: "海南港", coord: [110.33, 20.03], type: "project", region: "供应基地·海南", suppliers: 8, amount: "12亿" },
];

const HUB: [number, number] = [108.95, 34.27]; // 西安附近作为枢纽中心

const topRanking = [
  { name: "上海宝山钢铁集团", amount: "¥21.4亿" },
  { name: "中铁电气化局", amount: "¥18.6亿" },
  { name: "三一重工股份", amount: "¥16.2亿" },
  { name: "海螺水泥集团", amount: "¥14.8亿" },
  { name: "中联重科科技", amount: "¥12.6亿" },
  { name: "徐工机械集团", amount: "¥11.2亿" },
  { name: "中天科技股份", amount: "¥9.8亿" },
  { name: "金田铜业", amount: "¥8.6亿" },
  { name: "华润水泥控股", amount: "¥7.4亿" },
  { name: "正泰电气股份", amount: "¥6.9亿" },
];

const warnings = [
  { label: "采购计划预警", count: 38, sub: "逾期未启动" },
  { label: "采购寻源预警", count: 21, sub: "流标/废标" },
  { label: "采购价格预警", count: 56, sub: "价差异常" },
  { label: "合同履约预警", count: 14, sub: "到期/违约" },
];

function Panel({ title, extra, children, className = "" }: any) {
  return (
    <div className={`rounded-xl border ${className}`} style={{ background: COLORS.panel, borderColor: COLORS.border, boxShadow: "0 0 0 1px rgba(64,158,255,0.06) inset, 0 0 24px rgba(63,169,245,0.08)" }}>
      {title && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b" style={{ borderColor: "rgba(64,158,255,0.12)" }}>
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 rounded-sm" style={{ background: COLORS.cyan, boxShadow: `0 0 6px ${COLORS.cyan}` }} />
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>{title}</span>
          </div>
          {extra}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

function PurchaseStats() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {purchaseStats.map((s) => (
        <div key={s.label} className="rounded-lg p-2.5 min-w-0" style={{ background: "rgba(63,169,245,0.06)", border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate" style={{ color: COLORS.textDim, fontSize: 11 }}>{s.label}</span>
            <span className="flex items-center gap-0.5 flex-shrink-0" style={{ color: COLORS.orange, fontSize: 10 }}>
              <ArrowUpRight className="w-2.5 h-2.5" />{s.growth}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1 min-w-0">
            <span className="truncate" style={{ color: COLORS.text, fontSize: 16, fontWeight: 700 }}>{s.value}</span>
            <span className="flex-shrink-0" style={{ color: COLORS.textDim, fontSize: 10 }}>{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DemandForecast() {
  const option = {
    grid: { left: 0, right: 36, top: 6, bottom: 0, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "rgba(8,20,38,0.95)", borderColor: COLORS.borderStrong, textStyle: { color: COLORS.text, fontSize: 12 } },
    xAxis: { type: "value", show: false, max: 1000 },
    yAxis: {
      type: "category",
      data: demandForecast.map((d) => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 11 },
    },
    series: [{
      type: "bar",
      data: demandForecast.map((d) => d.v).reverse(),
      barWidth: 9,
      itemStyle: {
        borderRadius: 4,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: COLORS.cyan }, { offset: 1, color: COLORS.green },
        ]),
        shadowBlur: 8,
        shadowColor: "rgba(63,169,245,0.5)",
      },
      label: { show: true, position: "right", color: COLORS.cyanSoft, fontSize: 11, formatter: "{c} 项" },
    }],
  };
  return <ReactECharts option={option} style={{ height: 188 }} />;
}

function RatesRings() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {ratesData.map((r) => {
        const option = {
          series: [{
            type: "gauge",
            startAngle: 90,
            endAngle: -270,
            radius: "92%",
            pointer: { show: false },
            progress: { show: true, overlap: false, roundCap: true, clip: false, width: 8, itemStyle: { color: r.color, shadowBlur: 8, shadowColor: r.color } },
            axisLine: { lineStyle: { width: 8, color: [[1, "rgba(63,169,245,0.12)"]] } },
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            data: [{ value: r.value }],
            detail: { valueAnimation: false, formatter: "{value}%", color: r.color, fontSize: 16, fontWeight: 700, offsetCenter: [0, 0] },
          }],
        };
        return (
          <div key={r.name} className="flex flex-col items-center">
            <ReactECharts option={option} style={{ width: 78, height: 78 }} />
            <div className="-mt-1 text-center" style={{ color: COLORS.text, fontSize: 11 }}>{r.name}</div>
          </div>
        );
      })}
    </div>
  );
}

function SupplierPie() {
  const total = 286420;
  const option = {
    tooltip: { trigger: "item", backgroundColor: "rgba(8,20,38,0.95)", borderColor: COLORS.borderStrong, textStyle: { color: COLORS.text, fontSize: 12 }, formatter: "{b}：{c}% ({d}%)" },
    series: [{
      type: "pie",
      radius: ["58%", "82%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: COLORS.bg, borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data: supplierCategories.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
    }],
    graphic: [
      { type: "text", left: "center", top: "38%", style: { text: total.toLocaleString(), fill: COLORS.cyan, fontSize: 20, fontWeight: 700 } },
      { type: "text", left: "center", top: "58%", style: { text: "供应商总数", fill: COLORS.textDim, fontSize: 10 } },
    ],
  };
  return (
    <div>
      <ReactECharts option={option} style={{ height: 160 }} />
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
        {supplierCategories.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <i className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span style={{ color: COLORS.textDim, fontSize: 10 }}>{s.name}</span>
            <span style={{ color: COLORS.text, fontSize: 10 }} className="ml-auto">{s.value}%</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-lg p-2 text-center" style={{ background: "rgba(63,169,245,0.08)", border: `1px solid ${COLORS.border}` }}>
          <div style={{ color: COLORS.cyanSoft, fontSize: 16, fontWeight: 700 }}>86,420</div>
          <div style={{ color: COLORS.textDim, fontSize: 10 }}>累计合同份数</div>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,159,67,0.08)", border: "1px solid rgba(255,159,67,0.25)" }}>
          <div style={{ color: COLORS.orange, fontSize: 16, fontWeight: 700 }}>¥1,286亿</div>
          <div style={{ color: COLORS.textDim, fontSize: 10 }}>累计合同总额</div>
        </div>
      </div>
    </div>
  );
}

const MAP_SOURCES = [
  "https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/china.json",
  "https://unpkg.com/echarts@4.9.0/map/json/china.json",
  "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
  "https://fastly.jsdelivr.net/npm/echarts@4.9.0/map/json/china.json",
];

async function loadChinaMap(): Promise<boolean> {
  if ((echarts as any).getMap?.("china")) return true;
  for (const url of MAP_SOURCES) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const geo = await r.json();
      if (geo && (geo.features || geo.type)) {
        echarts.registerMap("china", geo as any);
        return true;
      }
    } catch {
      // try next
    }
  }
  return false;
}

function ChinaMap() {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    loadChinaMap().then((ok) => {
      if (cancelled) return;
      setStatus(ok ? "ready" : "failed");
    });
    return () => { cancelled = true; };
  }, []);

  const option = useMemo(() => {
    const projects = NODES.filter((n) => n.type === "project").map((n) => ({ name: n.name, value: [...n.coord, n.suppliers], info: n }));
    const cores = NODES.filter((n) => n.type === "core").map((n) => ({ name: n.name, value: [...n.coord, n.suppliers], info: n }));
    const risks = NODES.filter((n) => n.type === "risk").map((n) => ({ name: n.name, value: [...n.coord, 1], info: n }));
    const lines = NODES.map((n) => ({
      coords: [HUB, n.coord],
      lineStyle: { color: n.type === "risk" ? COLORS.red : COLORS.cyan },
    }));
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(8,20,38,0.95)",
        borderColor: COLORS.borderStrong,
        borderWidth: 1,
        padding: 10,
        textStyle: { color: COLORS.text, fontSize: 12 },
        formatter: (p: any) => {
          const n: Node | undefined = p.data?.info;
          if (!n) return p.name;
          return `<div style="min-width:160px"><div style="color:${COLORS.cyan};font-weight:600;margin-bottom:4px">${n.name}</div><div style="color:${COLORS.textDim};font-size:11px">${n.region}</div><div style="margin-top:4px;color:${COLORS.text}">${n.suppliers} 家供应商 · ${n.amount}</div></div>`;
        },
      },
      geo: {
        map: "china",
        roam: false,
        zoom: 1.15,
        center: [105, 36],
        itemStyle: {
          areaColor: "rgba(63,169,245,0.08)",
          borderColor: "rgba(63,169,245,0.55)",
          borderWidth: 1,
          shadowColor: "rgba(63,169,245,0.6)",
          shadowBlur: 12,
        },
        emphasis: {
          itemStyle: { areaColor: "rgba(63,169,245,0.18)" },
          label: { color: COLORS.cyanSoft },
        },
        label: { show: false },
        regions: [{ name: "南海诸岛", itemStyle: { areaColor: "transparent", borderColor: "transparent" }, label: { show: false } }],
      },
      series: [
        {
          name: "采供连线",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 2,
          effect: { show: true, period: 6, trailLength: 0.4, symbol: "circle", symbolSize: 3, color: COLORS.cyanSoft },
          lineStyle: { width: 1, opacity: 0.65, curveness: 0.25 },
          data: lines,
        },
        {
          name: "中心枢纽",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 14,
          itemStyle: { color: COLORS.cyan, shadowBlur: 12, shadowColor: COLORS.cyan },
          label: { show: true, position: "top", color: COLORS.cyanSoft, fontSize: 11, fontWeight: 700, formatter: "总部调度中心" },
          data: [{ name: "总部", value: [...HUB, 999] }],
        },
        {
          name: "项目部",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 3 },
          symbolSize: 8,
          itemStyle: { color: COLORS.cyan, shadowBlur: 8, shadowColor: COLORS.cyan },
          label: { show: true, position: "right", color: COLORS.text, fontSize: 10, formatter: (p: any) => p.name },
          data: projects,
        },
        {
          name: "核心供应商",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 14,
          itemStyle: { color: COLORS.orange, shadowBlur: 12, shadowColor: COLORS.orange },
          label: { show: true, position: "right", color: COLORS.orangeSoft, fontSize: 11, fontWeight: 600, formatter: (p: any) => p.name },
          data: cores,
        },
        {
          name: "风险节点",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 5 },
          symbolSize: 10,
          itemStyle: { color: COLORS.red, shadowBlur: 12, shadowColor: COLORS.red },
          label: { show: true, position: "right", color: COLORS.red, fontSize: 10, formatter: (p: any) => p.name },
          data: risks,
        },
      ],
    };
  }, [status]);

  return (
    <div className="absolute inset-0">
      {status === "ready" ? (
        <ReactECharts option={option} style={{ width: "100%", height: "100%", minHeight: 320 }} notMerge lazyUpdate opts={{ renderer: "canvas" }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ color: COLORS.textDim, fontSize: 12 }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: status === "failed" ? COLORS.red : COLORS.cyan }} />
            {status === "failed" ? "地图资源加载失败，请检查网络" : "正在加载中国地图…"}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute top-14 left-4 w-[240px] z-10">
      <Panel title="供应链实时状态" extra={
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      }>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: COLORS.textDim }}>采供连线总数</span>
            <span style={{ color: COLORS.cyan, fontWeight: 600 }}>12,486 条</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: COLORS.textDim }}>正常链路占比</span>
            <span style={{ color: COLORS.green, fontWeight: 600 }}>96.4%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: COLORS.textDim }}>风险链路占比</span>
            <span style={{ color: COLORS.red, fontWeight: 600 }}>3.6%</span>
          </div>
          <div className="h-px my-2" style={{ background: COLORS.border }} />
          <div style={{ color: COLORS.text, fontSize: 11, marginBottom: 6 }}>核心供应商 TOP10</div>
          <div className="space-y-1 max-h-[220px] overflow-auto pr-1">
            {topRanking.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{
                    background: i < 3 ? "rgba(255,159,67,0.18)" : "rgba(63,169,245,0.12)",
                    color: i < 3 ? COLORS.orange : COLORS.cyan, fontSize: 9, fontWeight: 700,
                  }}>{i + 1}</span>
                  <span style={{ color: COLORS.text }} className="truncate">{t.name}</span>
                </div>
                <span style={{ color: COLORS.cyanSoft }}>{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function TopMetrics() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {topMetrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 min-w-0" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, boxShadow: "0 0 16px rgba(63,169,245,0.08) inset" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(63,169,245,0.12)", color: COLORS.cyan, boxShadow: `0 0 12px ${COLORS.cyan}40` }}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate" style={{ color: COLORS.cyanSoft, fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>{m.value}</div>
              <div className="truncate" style={{ color: COLORS.textDim, fontSize: 11 }}>{m.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickEntries() {
  return (
    <div className="grid grid-cols-6 gap-2">
      {quickEntries.map((q) => {
        const Icon = q.icon;
        return (
          <button key={q.name} className="group rounded-lg py-2.5 transition-all hover:bg-[rgba(63,169,245,0.08)]" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}>
            <div className="flex flex-col items-center gap-1">
              <Icon className="w-5 h-5" style={{ color: COLORS.cyan }} />
              <span style={{ color: COLORS.text, fontSize: 11 }}>{q.name}</span>
              <span style={{ color: COLORS.orange, fontSize: 11, fontWeight: 600 }}>{q.amount}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PriceMonitor() {
  const option = {
    grid: { left: 0, right: 50, top: 8, bottom: 0, containLabel: true },
    tooltip: { trigger: "axis", backgroundColor: "rgba(8,20,38,0.95)", borderColor: COLORS.borderStrong, textStyle: { color: COLORS.text } },
    xAxis: { type: "value", show: false, max: 5000 },
    yAxis: {
      type: "category",
      data: ["市场实时价", "战采协议价"],
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 11 },
    },
    series: [{
      type: "bar",
      barWidth: 14,
      data: [
        { value: 4260, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: COLORS.orange }, { offset: 1, color: COLORS.red }]), borderRadius: 4 } },
        { value: 3860, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: COLORS.green }, { offset: 1, color: COLORS.cyan }]), borderRadius: 4 } },
      ],
      label: { show: true, position: "right", color: COLORS.text, fontSize: 11, formatter: "¥{c}" },
    }],
  };
  return (
    <Panel title="价格监控中心">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-md p-2 text-center" style={{ background: "rgba(63,169,245,0.08)" }}>
          <div style={{ color: COLORS.cyan, fontSize: 14, fontWeight: 700 }}>1,286</div>
          <div style={{ color: COLORS.textDim, fontSize: 10 }}>战采协议价</div>
        </div>
        <div className="rounded-md p-2 text-center" style={{ background: "rgba(63,169,245,0.08)" }}>
          <div style={{ color: COLORS.cyan, fontSize: 14, fontWeight: 700 }}>3,420</div>
          <div style={{ color: COLORS.textDim, fontSize: 10 }}>钢材网实时</div>
        </div>
        <div className="rounded-md p-2 text-center" style={{ background: "rgba(63,169,245,0.08)" }}>
          <div style={{ color: COLORS.cyan, fontSize: 14, fontWeight: 700 }}>1,860</div>
          <div style={{ color: COLORS.textDim, fontSize: 10 }}>水泥网实时</div>
        </div>
      </div>
      <div style={{ color: COLORS.text, fontSize: 11, marginBottom: 2 }}>螺纹钢价格对比（元/吨）</div>
      <ReactECharts option={option} style={{ height: 90 }} />
      <div className="text-[10px] pt-1" style={{ color: COLORS.textDim }}>价差 ¥400 / 吨 · 同比下降 <span style={{ color: COLORS.red }}>4.2%</span></div>
    </Panel>
  );
}

function RiskCenter() {
  return (
    <Panel title="风险预警中心" extra={<AlertTriangle className="w-3.5 h-3.5" style={{ color: COLORS.red }} />}>
      <div className="grid grid-cols-2 gap-2">
        {warnings.map((w) => (
          <div key={w.label} className="rounded-md p-2.5" style={{ background: "rgba(255,90,95,0.06)", border: "1px solid rgba(255,90,95,0.22)" }}>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.text, fontSize: 11 }}>{w.label}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: COLORS.red, boxShadow: `0 0 6px ${COLORS.red}` }} />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span style={{ color: COLORS.red, fontSize: 20, fontWeight: 700 }}>{w.count}</span>
              <span style={{ color: COLORS.textDim, fontSize: 10 }}>{w.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AISuggestion() {
  return (
    <Panel title="AI 智能提报建议" extra={<Sparkles className="w-3.5 h-3.5" style={{ color: COLORS.orange }} />}>
      <div className="space-y-2">
        <div className="rounded-md p-2.5" style={{ background: "rgba(63,169,245,0.06)", border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: COLORS.cyan, color: "#061325", fontSize: 10, fontWeight: 700 }}>1</span>
            <span style={{ color: COLORS.cyan, fontSize: 11, fontWeight: 600 }}>计划提报建议</span>
          </div>
          <div style={{ color: COLORS.text, fontSize: 11, lineHeight: 1.6 }}>
            <span style={{ color: COLORS.orange }}>济南西站项目部</span>已完成项目提报入场，系统建议依据往期同类项目性质，自动生成采购计划提报方案，待人工确认。
          </div>
        </div>
        <div className="rounded-md p-2.5" style={{ background: "rgba(255,159,67,0.06)", border: "1px solid rgba(255,159,67,0.22)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: COLORS.orange, color: "#061325", fontSize: 10, fontWeight: 700 }}>2</span>
            <span style={{ color: COLORS.orange, fontSize: 11, fontWeight: 600 }}>采购触发建议</span>
          </div>
          <div style={{ color: COLORS.text, fontSize: 11, lineHeight: 1.6 }}>
            系统检测到【<span style={{ color: COLORS.orange }}>螺纹钢-HRB400</span>】价格连续 3 月上涨，且 <span style={{ color: COLORS.orange }}>京沪改扩</span> 项目该类备品物资库存不足，建议触发采购智能体，自动发起采购申请。
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function ControlTower() {
  const now = useMemo(() => new Date().toLocaleString("zh-CN", { hour12: false }), []);
  const [statusOpen, setStatusOpen] = useState(false);
  return (
    <div className="relative w-full" style={{ background: COLORS.bg, color: COLORS.text, minHeight: "100%", aspectRatio: "16 / 9" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(ellipse at center, rgba(63,169,245,0.08) 0%, transparent 60%), linear-gradient(180deg, #061325 0%, #04101e 100%)",
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "linear-gradient(rgba(63,169,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(63,169,245,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative h-12 flex items-center justify-between px-5 border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
          <span style={{ color: COLORS.cyanSoft, fontSize: 11 }}>系统运行正常</span>
        </div>
        <div style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
          中铁建供应链控制塔 · 数字化管控中心
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 11 }}>{now}</div>
      </div>

      <div className="relative grid grid-cols-12 gap-3 p-3" style={{ height: "calc(100% - 48px)" }}>
        <div className="col-span-3 flex flex-col gap-3 overflow-auto">
          <Panel title="采购与需求"><PurchaseStats /></Panel>
          <Panel title="各单位需求预测"><DemandForecast /></Panel>
          <Panel title="分析指标"><RatesRings /></Panel>
          <Panel title="供应商管理"><SupplierPie /></Panel>
        </div>

        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          <TopMetrics />
          <div className="flex-1 relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(8,20,38,0.6), rgba(4,16,30,0.9))", border: `1px solid ${COLORS.border}`, boxShadow: "0 0 32px rgba(63,169,245,0.1) inset" }}>
            <ChinaMap />
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition hover:bg-[rgba(63,169,245,0.15)]"
              style={{ background: COLORS.panel, border: `1px solid ${statusOpen ? COLORS.borderStrong : COLORS.border}`, color: COLORS.cyanSoft }}
            >
              <Activity className="w-3.5 h-3.5" />
              实时状态
            </button>
            <StatusOverlay open={statusOpen} onClose={() => setStatusOpen(false)} />
            <div className="absolute bottom-3 right-3 rounded-lg px-3 py-2 flex items-center gap-3 text-[10px] z-10" style={{ background: "rgba(8,20,38,0.85)", border: `1px solid ${COLORS.border}` }}>
              <span className="flex items-center gap-1" style={{ color: COLORS.textDim }}><i className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.cyan }} />项目部</span>
              <span className="flex items-center gap-1" style={{ color: COLORS.textDim }}><i className="w-2 h-2 rounded-full" style={{ background: COLORS.orange }} />核心供应商</span>
              <span className="flex items-center gap-1" style={{ color: COLORS.textDim }}><i className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.red }} />风险节点</span>
            </div>
          </div>
          <QuickEntries />
        </div>

        <div className="col-span-3 flex flex-col gap-3 overflow-auto">
          <PriceMonitor />
          <RiskCenter />
          <AISuggestion />
        </div>
      </div>
    </div>
  );
}
