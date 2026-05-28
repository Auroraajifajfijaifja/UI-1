import React, { createElement as h, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  AlertTriangle, Sparkles, Building2,
  Users, Wrench, GraduationCap, Cloud, Store, Recycle, Truck, Globe, Plane,
  ArrowUpRight, ArrowDownRight, Activity, X,
  Layers, TrendingUp, Target, Award,
  Zap, Shield, Package, MapPin, Navigation2, ChevronRight,
} from "lucide-react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg:            "#08122E",
  panel:         "rgba(15,28,58,0.72)",
  panelHover:    "rgba(20,38,72,0.85)",
  border:        "rgba(41,182,246,0.22)",
  borderStrong:  "rgba(41,182,246,0.45)",
  borderOrange:  "rgba(255,125,0,0.30)",
  text:          "#cfe1ff",
  textDim:       "#7c93b3",
  textMuted:     "#4a6080",
  cyan:          "#29B6F6",
  cyanSoft:      "#5ec6ff",
  orange:        "#FF7D00",
  orangeSoft:    "#ffc278",
  red:           "#F44336",
  green:         "#27D6A5",
  radius:        "14px",
};

// ─── Shared Sub-components ────────────────────────────────────────────────────
function Panel({
  title, extra, children, className = "", noPad = false,
}: {
  title?: string; extra?: React.ReactNode; children: React.ReactNode;
  className?: string; noPad?: boolean;
}) {
  return (
    <div
      className={`relative rounded-[14px] border transition-all duration-200 hover:border-[rgba(41,182,246,0.40)] hover:shadow-[0_0_20px_rgba(41,182,246,0.12)] ${className}`}
      style={{
        background: T.panel,
        borderColor: T.border,
        boxShadow: `0 0 0 1px rgba(41,182,246,0.04) inset, 0 4px 24px rgba(0,0,0,0.4)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {title && (
        <div
          className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b"
          style={{ borderColor: "rgba(41,182,246,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1 h-3.5 rounded-sm"
              style={{
                background: T.cyan,
                boxShadow: `0 0 6px ${T.cyan}`,
              }}
            />
            <span style={{ color: T.text, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>
              {title}
            </span>
          </div>
          {extra}
        </div>
      )}
      <div className={noPad ? "" : "p-3.5"}>{children}</div>
    </div>
  );
}

// ─── 价格中心筛选栏 ──────────────────────────────────────────────────────────
interface PriceFilterState {
  material: string;
  package: string;
  spec: string;
  timeRange: string;
  province: string;
  city: string;
}

const cityData: Record<string, string[]> = {
  "河北": ["石家庄", "唐山", "邯郸", "保定", "张家口", "廊坊"],
  "山东": ["济南", "青岛", "烟台", "潍坊", "临沂", "淄博"],
  "江苏": ["南京", "苏州", "无锡", "常州", "南通", "徐州"],
  "广东": ["广州", "深圳", "东莞", "佛山", "珠海", "中山"],
  "四川": ["成都", "绵阳", "德阳", "宜宾", "南充", "泸州"],
  "浙江": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴"],
  "河南": ["郑州", "洛阳", "开封", "新乡", "南阳", "许昌"],
  "湖北": ["武汉", "宜昌", "襄阳", "荆州", "黄石", "十堰"],
  "湖南": ["长沙", "株洲", "湘潭", "衡阳", "岳阳", "常德"],
  "安徽": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北"],
  "福建": ["福州", "厦门", "泉州", "漳州", "莆田", "宁德"],
  "江西": ["南昌", "赣州", "九江", "宜春", "上饶", "抚州"],
};

function PriceFilterBar({
  filters,
  onChange,
}: {
  filters: PriceFilterState;
  onChange: (f: PriceFilterState) => void;
}) {
  const dropdownData = {
    material: ["钢筋", "水泥", "混凝土", "木材", "砂石"],
    package: ["包件 A", "包件 B", "包件 C", "包件 D"],
    spec: ["HRB400E", "HRB500E", "PO 42.5", "PC 32.5", "C30", "C40"],
  };
  const timeOptions = ["年", "月", "周", "日"];
  const provinces = Object.keys(cityData);

  const handleChange = (key: keyof PriceFilterState, value: string) => {
    if (key === "province") {
      onChange({ ...filters, province: value, city: "" });
    } else {
      onChange({ ...filters, [key]: value });
    }
  };

  const dropdownStyle: React.CSSProperties = {
    appearance: "none",
    WebkitAppearance: "none",
    background: "rgba(8,18,46,0.90)",
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    color: T.text,
    fontSize: 11,
    padding: "5px 28px 5px 10px",
    cursor: "pointer",
    outline: "none",
    minWidth: 70,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237c93b3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    transition: "border-color 0.2s",
  };

  const selectWrap: React.CSSProperties = {
    position: "relative",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        background: "rgba(8,18,46,0.55)",
        border: `1px solid rgba(41,182,246,0.10)`,
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {(["material", "package", "spec"] as const).map((key) => (
        <div key={key} style={selectWrap}>
          <select
            value={filters[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{
              ...dropdownStyle,
              minWidth: key === "spec" ? 80 : 70,
            }}
          >
            <option value="">全部</option>
            {dropdownData[key].map((opt) => (
              <option key={opt} value={opt} style={{ background: "#08122E" }}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div style={{ width: 1, height: 16, background: `${T.border}`, flexShrink: 0 }} />

      {/* 时间 segment */}
      <div
        style={{
          display: "flex",
          background: "rgba(8,18,46,0.90)",
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {timeOptions.map((opt, i) => {
          const isActive = filters.timeRange === opt;
          return (
            <button
              key={opt}
              onClick={() => handleChange("timeRange", opt)}
              style={{
                background: isActive ? "rgba(41,182,246,0.22)" : "transparent",
                border: "none",
                borderRight: i < timeOptions.length - 1 ? `1px solid ${T.border}` : "none",
                color: isActive ? T.cyanSoft : T.textDim,
                fontSize: 11,
                padding: "5px 10px",
                cursor: "pointer",
                transition: "all 0.2s",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 16, background: `${T.border}`, flexShrink: 0 }} />

      {/* 省 */}
      <div style={selectWrap}>
        <select
          value={filters.province}
          onChange={(e) => handleChange("province", e.target.value)}
          style={{ ...dropdownStyle, minWidth: 70 }}
        >
          <option value="">全部省份</option>
          {provinces.map((p) => (
            <option key={p} value={p} style={{ background: "#08122E" }}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 市 */}
      <div style={selectWrap}>
        <select
          value={filters.city}
          onChange={(e) => handleChange("city", e.target.value)}
          disabled={!filters.province}
          style={{
            ...dropdownStyle,
            minWidth: 70,
            opacity: filters.province ? 1 : 0.4,
            cursor: filters.province ? "pointer" : "not-allowed",
          }}
        >
          <option value="">全部城市</option>
          {(cityData[filters.province] || []).map((c) => (
            <option key={c} value={c} style={{ background: "#08122E" }}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── 左侧模块 1: 采购与需求总览 ─────────────────────────────────────────────
const purchaseStats = [
  { label: "采购计划金额", value: "218.6", unit: "亿元", growth: "+8.6%", up: true },
  { label: "采购寻源金额", value: "186.4", unit: "亿元", growth: "+6.2%", up: true },
  { label: "采购合同金额", value: "162.8", unit: "亿元", growth: "+9.1%", up: true },
  { label: "采购结算金额", value: "128.5", unit: "亿元", growth: "+7.5%", up: true },
];

function PurchaseStatsCard() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const trends: Record<string, number[]> = {
    "采购计划金额": [180,195,188,200,205,210,195,220,215,218,225,218],
    "采购寻源金额": [150,162,158,168,172,178,165,185,180,186,192,186],
    "采购合同金额": [130,145,140,150,155,160,148,165,160,162,168,162],
    "采购结算金额": [100,108,105,112,115,118,110,122,120,125,130,128],
  };

  const chartOption = useMemo(() => ({
    grid: { left: 0, right: 0, top: 4, bottom: 20, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(8,18,46,0.95)",
      borderColor: T.borderStrong,
      textStyle: { color: T.text, fontSize: 10 },
    },
    xAxis: {
      type: "category",
      data: months,
      axisLine: { lineStyle: { color: "rgba(41,182,246,0.2)" } },
      axisLabel: { color: T.textDim, fontSize: 9 },
      splitLine: { show: false },
    },
    yAxis: { type: "value", show: false },
    series: [{
      type: "line",
      smooth: 0.4,
      symbol: "none",
      lineStyle: { color: T.cyan, width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(41,182,246,0.25)" },
          { offset: 1, color: "rgba(41,182,246,0.02)" },
        ]),
      },
    }],
  }), []);

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: tooltipPos.x,
    top: tooltipPos.y,
    width: 290,
    borderRadius: 14,
    background: "rgba(8,18,46,0.97)",
    border: `1px solid ${T.borderStrong}`,
    boxShadow: `0 0 30px rgba(41,182,246,0.25), 0 8px 32px rgba(0,0,0,0.6)`,
    backdropFilter: "blur(16px)",
    padding: "12px 14px",
    zIndex: 9999,
    pointerEvents: "none",
  };

  const tooltipContent = hovered ? (
    <div style={tooltipStyle}>
      <div style={{ color: T.cyanSoft, fontSize: 12, marginBottom: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 6px ${T.cyan}`, display: "inline-block" }} />
        近12个月趋势 — {hovered}
      </div>
      <ReactECharts
        option={{ ...chartOption, series: [{ ...chartOption.series[0], data: trends[hovered] }] }}
        style={{ height: 90 }}
        opts={{ renderer: "svg" }}
      />
    </div>
  ) : null;

  return (
    <>
      {tooltipContent && createPortal(tooltipContent, document.body)}
      <Panel title="采购交易">
        <div className="grid grid-cols-2 gap-2.5">
          {purchaseStats.map((s) => (
            <div
              key={s.label}
              ref={(el) => { cardRefs.current[s.label] = el; }}
              className="relative rounded-xl p-3 cursor-pointer transition-all duration-200"
              style={{
                background: hovered === s.label ? "rgba(41,182,246,0.14)" : "rgba(41,182,246,0.06)",
                border: `1px solid ${hovered === s.label ? T.borderStrong : "rgba(41,182,246,0.15)"}`,
                boxShadow: hovered === s.label ? `0 0 16px rgba(41,182,246,0.2) inset` : "none",
              }}
              onMouseEnter={(e) => {
                setHovered(s.label);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({
                  x: rect.left,
                  y: rect.top - 4,
                });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="truncate" style={{ color: T.textDim, fontSize: 11 }}>{s.label}</span>
                <span
                  className="flex items-center gap-0.5 flex-shrink-0"
                  style={{ color: s.up ? T.green : T.red, fontSize: 10 }}
                >
                  {s.up
                    ? <ArrowUpRight className="w-2.5 h-2.5" />
                    : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {s.growth}
                </span>
              </div>
              <div className="flex items-baseline gap-1 min-w-0">
                <span className="truncate" style={{ color: T.cyanSoft, fontSize: 17, fontWeight: 700 }}>
                  {s.value}
                </span>
                <span className="flex-shrink-0" style={{ color: T.textDim, fontSize: 10 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ─── 左侧模块 2: 需求预测 ───────────────────────────────────────────────────
const demandForecast = [
  { name: "中铁建华北公司", v: 920 },
  { name: "中铁建华东公司", v: 880 },
  { name: "中铁建华南公司", v: 760 },
  { name: "中铁建西南公司", v: 680 },
  { name: "中铁建西北公司", v: 540 },
  { name: "中铁建东北公司", v: 420 },
];

function DemandForecastCard() {
  const option = {
    grid: { left: 0, right: 44, top: 6, bottom: 0, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(8,18,46,0.95)",
      borderColor: T.borderStrong,
      textStyle: { color: T.text, fontSize: 12 },
    },
    xAxis: { type: "value", show: false, max: 1000 },
    yAxis: {
      type: "category",
      data: demandForecast.map((d) => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: T.text, fontSize: 11 },
    },
    series: [{
      type: "bar",
      data: demandForecast.map((d) => d.v).reverse(),
      barWidth: 10,
      itemStyle: {
        borderRadius: 5,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: T.cyan },
          { offset: 1, color: T.green },
        ]),
        shadowBlur: 8,
        shadowColor: "rgba(41,182,246,0.5)",
      },
      label: { show: true, position: "right", color: T.cyanSoft, fontSize: 11, formatter: "{c} 项" },
    }],
  };
  return (
    <Panel title="采购需求预测">
      <ReactECharts option={option} style={{ height: 188 }} />
    </Panel>
  );
}

// ─── 左侧模块 3: 采购五率 ───────────────────────────────────────────────────
const ratesData = [
  { name: "计划集中采购率", value: 95, color: T.cyan },
  { name: "公开采购率", value: 96, color: "#5ec6ff" },
  { name: "电子采购率", value: 97, color: T.orange },
  { name: "寻源集中采购率", value: 98, color: T.green },
  { name: "寻源合同备案率", value: 99, color: "#8b5cf6" },
];

function RatesCard() {
  return (
    <Panel title="采购五率">
      <div
        className="grid grid-cols-5 gap-1 rounded-xl py-1.5"
        style={{ background: "rgba(41,182,246,0.03)" }}
      >
        {ratesData.map((r) => {
          const option = {
            series: [{
              type: "gauge",
              startAngle: 90,
              endAngle: -270,
              radius: "90%",
              pointer: { show: false },
              progress: {
                show: true, overlap: false, roundCap: true, clip: false, width: 6,
                itemStyle: {
                  color: r.color,
                  shadowBlur: 8,
                  shadowColor: r.color,
                },
              },
              axisLine: { lineStyle: { width: 6, color: [[1, "rgba(41,182,246,0.04)"]] } },
              splitLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              data: [{ value: r.value }],
              detail: {
                valueAnimation: false,
                formatter: "{value}%",
                color: r.color,
                fontSize: 11,
                fontWeight: 700,
                offsetCenter: [0, 0],
              },
            }],
          };
          return (
            <div key={r.name} className="flex flex-col items-center">
              <ReactECharts
                option={option}
                style={{ width: 56, height: 56 }}
                className="border-0"
                opts={{ renderer: "canvas" }}
              />
              <div className="-mt-0.5 text-center leading-tight" style={{ color: T.text, fontSize: 9 }}>
                {r.name}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── 左侧模块 4: 供应商管理 ─────────────────────────────────────────────────
const supplierCategories = [
  { name: "物资类", value: 38, color: T.cyan },
  { name: "设备类", value: 18, color: "#5ec6ff" },
  { name: "办公劳保类", value: 8, color: T.green },
  { name: "服务类", value: 16, color: T.orange },
  { name: "工程分包类", value: 14, color: T.orangeSoft },
  { name: "信息化服务商", value: 6, color: "#8b5cf6" },
];

function SupplierCard() {
  const total = 286420;
  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(8,18,46,0.95)",
      borderColor: T.borderStrong,
      textStyle: { color: T.text, fontSize: 12 },
      formatter: "{b}：{c}%",
    },
    series: [{
      type: "pie",
      radius: ["55%", "80%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: T.bg, borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data: supplierCategories.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
    }],
    graphic: [
      { type: "text", left: "center", top: "36%", style: { text: total.toLocaleString(), fill: T.cyan, fontSize: 18, fontWeight: 700 } },
      { type: "text", left: "center", top: "56%", style: { text: "供应商总数", fill: T.textDim, fontSize: 10 } },
    ],
  };
  return (
    <Panel title="供应商类型">
      <ReactECharts option={option} style={{ height: 152 }} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
        {supplierCategories.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <i className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="truncate" style={{ color: T.textDim, fontSize: 10 }}>{s.name}</span>
            <span className="ml-auto" style={{ color: T.text, fontSize: 10 }}>{s.value}%</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(41,182,246,0.08)", border: `1px solid ${T.border}` }}>
          <div style={{ color: T.cyanSoft, fontSize: 16, fontWeight: 700 }}>86,420</div>
          <div style={{ color: T.textDim, fontSize: 10 }}>累计合同份数</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,125,0,0.08)", border: "1px solid rgba(255,125,0,0.25)" }}>
          <div style={{ color: T.orange, fontSize: 16, fontWeight: 700 }}>¥1,286亿</div>
          <div style={{ color: T.textDim, fontSize: 10 }}>年度合同总额</div>
        </div>
      </div>
    </Panel>
  );
}

// ─── 顶部核心指标栏 ─────────────────────────────────────────────────────────
const topMetrics = [
  { icon: Building2, value: "17,000", label: "项目数量", accent: T.cyan },
  { icon: Users, value: "286,420", label: "入驻供应商", accent: T.orange },
  { icon: Wrench, value: "202,294", label: "设备数量", accent: T.green },
  { icon: GraduationCap, value: "57,187", label: "评标专家", accent: "#8b5cf6" },
];

function TopMetricsBar() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {topMetrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className="rounded-[14px] px-3.5 py-3 flex items-center gap-3 transition-all duration-200 hover:border-[rgba(41,182,246,0.45)] hover:shadow-[0_0_20px_rgba(41,182,246,0.15)] cursor-default"
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              boxShadow: `0 0 0 1px rgba(41,182,246,0.04) inset, 0 4px 20px rgba(0,0,0,0.35)`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${m.accent}18`,
                color: m.accent,
                boxShadow: `0 0 14px ${m.accent}40`,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="truncate"
                style={{
                  color: m.accent,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textShadow: `0 0 12px ${m.accent}60`,
                }}
              >
                {m.value}
              </div>
              <div className="truncate" style={{ color: T.textDim, fontSize: 11 }}>{m.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 中部视图一: 供应链拓扑网络地图 ────────────────────────────────────────

type Node = {
  name: string; coord: [number, number];
  type: "project" | "core" | "risk";
  region: string;
  suppliers: number;
  amount: string;
  settlement?: string;
  contracts?: number;
  status?: string;
  warningReason?: string;
  links?: {
    coreSupplierNames?: string[];
    riskSupplierNames?: string[];
  };
};

const NODES: Node[] = [
  // 原有节点保留
  { name: "贵阳桥路车间管内修建便道工程项目部", coord: [106.71, 26.60], type: "project", region: "贵州省贵阳市", suppliers: 4, amount: "3.2亿", settlement: "2.8亿",
    links: {
      coreSupplierNames: [
        "饶阳县润通铁路信号器材有限公司",
        "辽宁华信电气股份有限公司",
        "扬州贝尔思达通信科技有限公司",
      ],
      riskSupplierNames: [
        "鑫方盛数智科技股份有限公司",
      ],
    },
  },
  { name: "饶阳县润通铁路信号器材有限公司", coord: [115.72, 38.24], type: "core", region: "河北省衡水市饶阳县", suppliers: 0, amount: "2.1亿", settlement: "1.86亿", contracts: 24, status: "正常" },
  { name: "辽宁华信电气股份有限公司", coord: [123.43, 41.80], type: "core", region: "辽宁省沈阳市", suppliers: 0, amount: "3.8亿", settlement: "3.1亿", contracts: 27, status: "正常" },
  { name: "扬州贝尔思达通信科技有限公司", coord: [119.42, 32.39], type: "core", region: "江苏省扬州市", suppliers: 0, amount: "1.9亿", settlement: "1.62亿", contracts: 19, status: "正常" },
  { name: "鑫方盛数智科技股份有限公司", coord: [116.46, 39.90], type: "risk", region: "北京市市辖区大兴区", suppliers: 0, amount: "—", warningReason: "2025年通过股份框架询价方式，以最低价中标厦门轨道6号线华滨段项目型钢供货并签订采购合同。供货存在严重质量问题，不能用于现场使用，项目要求按照约定标准供货消除安全质量隐患遭到对方拒绝并停止供货。对方在开工阶段单方违约的行为直接影响现场施工进度。该合作方存在履约能力不足问题，且拒不履行合同主要义务，存在严重失信、重大违约行为。" },

  // 项目部2：哈尔滨瑞达水泥制品有限责任公司
  { name: "哈尔滨瑞达水泥制品有限责任公司", coord: [126.58, 45.55], type: "project", region: "黑龙江省哈尔滨市阿城区", suppliers: 6, amount: "—", settlement: "—",
    links: {
      coreSupplierNames: [
        "成都市创伟金诚科技有限责任公司",
        "重庆博云建工集团有限公司",
        "内蒙古昱博工程咨询有限公司",
        "青岛豪迈电缆集团有限公司",
      ],
      riskSupplierNames: [
        "林州市工务铁路器材制造有限公司",
        "鑫方盛数智科技股份有限公司",
      ],
    },
  },
  { name: "成都市创伟金诚科技有限责任公司", coord: [104.07, 30.68], type: "core", region: "四川省成都市新都区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "重庆博云建工集团有限公司", coord: [108.41, 30.62], type: "core", region: "重庆市市辖区万州区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "内蒙古昱博工程咨询有限公司", coord: [111.65, 40.82], type: "core", region: "内蒙古自治区呼和浩特市托克托县", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "青岛豪迈电缆集团有限公司", coord: [120.05, 36.27], type: "core", region: "山东省青岛市胶州市", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "林州市工务铁路器材制造有限公司", coord: [113.82, 36.06], type: "risk", region: "河南省安阳市林州市", suppliers: 0, amount: "—", warningReason: "经核查，该供应商存在经营异常，部分资质证照过期失效，且在多地有合同纠纷记录，履约能力存疑。" },

  // 项目部3：中铁二十三局集团第四工程有限公司西派玺樾小区项目施工总承包工程二标段项目经理部
  { name: "中铁二十三局集团第四工程有限公司西派玺樾小区项目施工总承包工程二标段项目经理部", coord: [108.93, 34.18], type: "project", region: "陕西省西安市长安区", suppliers: 5, amount: "—", settlement: "—",
    links: {
      coreSupplierNames: [
        "甘肃北弘实业有限公司",
        "台州市黄岩城投资产经营管理有限公司",
        "安庆庆远矿产资源开发有限公司",
        "福建盛鑫达贸易有限公司",
      ],
      riskSupplierNames: [
        "河南冠耀供应链管理有限公司",
      ],
    },
  },
  { name: "甘肃北弘实业有限公司", coord: [103.84, 36.06], type: "core", region: "甘肃省兰州市皋兰县", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "台州市黄岩城投资产经营管理有限公司", coord: [121.27, 28.65], type: "core", region: "浙江省台州市黄岩区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "安庆庆远矿产资源开发有限公司", coord: [117.03, 30.65], type: "core", region: "安徽省安庆市桐城市", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "福建盛鑫达贸易有限公司", coord: [119.30, 26.08], type: "core", region: "福建省福州市晋安区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "河南冠耀供应链管理有限公司", coord: [113.63, 34.76], type: "risk", region: "河南省郑州市金水区", suppliers: 0, amount: "—", warningReason: "该供应商曾因产品质量问题被多个项目投诉，存在履约记录不良情况，建议谨慎合作。" },

  // 项目部4：中铁二十三局集团有限公司第一分公司深汕铁路SSSG-5标项目经理部二分部
  { name: "中铁二十三局集团有限公司第一分公司深汕铁路SSSG-5标项目经理部二分部", coord: [114.12, 22.72], type: "project", region: "广东省深圳市深汕特别合作区", suppliers: 6, amount: "—", settlement: "—",
    links: {
      coreSupplierNames: [
        "中铁物资集团西南有限公司",
        "日照市昊市鑫经贸有限公司",
        "邯郸市希比希商贸有限公司",
        "黑龙江桦盛鹅业发展有限公司",
      ],
      riskSupplierNames: [
        "淮北殷实木业有限公司",
        "鑫方盛数智科技股份有限公司",
      ],
    },
  },
  { name: "中铁物资集团西南有限公司", coord: [104.06, 30.67], type: "core", region: "四川省成都市金牛区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "日照市昊市鑫经贸有限公司", coord: [119.53, 35.42], type: "core", region: "山东省日照市东港区", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "邯郸市希比希商贸有限公司", coord: [114.54, 36.63], type: "core", region: "河北省邯郸市曲周县", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "黑龙江桦盛鹅业发展有限公司", coord: [130.37, 46.81], type: "core", region: "黑龙江省佳木斯市桦川县", suppliers: 0, amount: "—", settlement: "—", contracts: 0, status: "正常" },
  { name: "淮北殷实木业有限公司", coord: [116.80, 33.96], type: "risk", region: "安徽省淮北市相山区", suppliers: 0, amount: "—", warningReason: "该供应商存在经营困难，曾被列入企业经营异常名录，履约能力不足，建议纳入风险管控。" },
];

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
    } catch { /* try next */ }
  }
  return false;
}

const topRanking = [
  { name: "上海宝山钢铁集团", amount: "¥21.4亿", projects: 12, contracts: 18 },
  { name: "中铁电气化局", amount: "¥18.6亿", projects: 8, contracts: 14 },
  { name: "三一重工股份", amount: "¥16.2亿", projects: 10, contracts: 22 },
  { name: "海螺水泥集团", amount: "¥14.8亿", projects: 15, contracts: 28 },
  { name: "中联重科科技", amount: "¥12.6亿", projects: 9, contracts: 16 },
  { name: "徐工机械集团", amount: "¥11.2亿", projects: 11, contracts: 20 },
  { name: "中天科技股份", amount: "¥9.8亿", projects: 7, contracts: 13 },
  { name: "中天钢铁集团", amount: "¥8.6亿", projects: 6, contracts: 11 },
  { name: "华润水泥控股", amount: "¥7.4亿", projects: 14, contracts: 25 },
  { name: "正泰电气股份", amount: "¥6.9亿", projects: 5, contracts: 9 },
  { name: "鞍钢股份集团", amount: "¥6.2亿", projects: 8, contracts: 15 },
  { name: "中国水利水电", amount: "¥5.8亿", projects: 12, contracts: 19 },
  { name: "中国建筑股份", amount: "¥5.5亿", projects: 9, contracts: 17 },
  { name: "中国交通建设", amount: "¥5.1亿", projects: 7, contracts: 12 },
  { name: "中国中铁股份", amount: "¥4.8亿", projects: 6, contracts: 10 },
];

function SupplyStatusOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute top-14 left-4 w-[260px] z-20">
      <Panel
        title="供应链网络实时状态"
        extra={
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-2">
          {[
            { label: "采供连线总数", value: "12,486 条", color: T.cyan },
            { label: "正常链路占比", value: "96.4%", color: T.green },
            { label: "风险链路占比", value: "3.6%", color: T.red },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span style={{ color: T.textDim }}>{item.label}</span>
              <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SupplierTopOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute top-14 left-4 w-[340px] z-20">
      <Panel
        title="核心供应商 TOP15"
        extra={
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-1.5 max-h-[420px] overflow-auto pr-1">
          {/* 表头 */}
          <div className="grid grid-cols-12 gap-1 mb-1 px-1">
            <span className="col-span-1 text-[9px]" style={{ color: T.textMuted }}>#</span>
            <span className="col-span-4 text-[9px]" style={{ color: T.textMuted }}>供应商名称</span>
            <span className="col-span-2 text-[9px]" style={{ color: T.textMuted, textAlign: "right" }}>合作项目</span>
            <span className="col-span-2 text-[9px]" style={{ color: T.textMuted, textAlign: "right" }}>合同份数</span>
            <span className="col-span-3 text-[9px]" style={{ color: T.textMuted, textAlign: "right" }}>合同金额</span>
          </div>
          {topRanking.map((t, i) => (
            <div key={t.name} className="grid grid-cols-12 gap-1 items-center px-1 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-default">
              <span
                className="col-span-1 w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: i < 3 ? "rgba(255,125,0,0.18)" : "rgba(41,182,246,0.12)",
                  color: i < 3 ? T.orange : T.cyan,
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span className="col-span-4 truncate text-[11px]" style={{ color: T.text }}>{t.name}</span>
              <span className="col-span-2 text-right text-[11px]" style={{ color: T.cyanSoft }}>{t.projects}家</span>
              <span className="col-span-2 text-right text-[11px]" style={{ color: T.text }}>{t.contracts}份</span>
              <span className="col-span-3 text-right text-[11px]" style={{ color: T.orangeSoft }}>{t.amount}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TopologyMap() {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [statusOpen, setStatusOpen] = useState(false);
  const [supplierTopOpen, setSupplierTopOpen] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<"project" | "core" | "risk">>(new Set());

  const _log = (loc: string, msg: string, data: any, hId: string) => fetch('http://127.0.0.1:7585/ingest/a5adcf04-9eef-4d1f-8acd-e109d4f7ada9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0a6124'},body:JSON.stringify({sessionId:'0a6124',location:loc,message:msg,data,timestamp:Date.now(),hypothesisId:hId})}).catch(()=>{});

  useEffect(() => {
    let cancelled = false;
    loadChinaMap().then((ok) => {
      if (cancelled) return;
      setStatus(ok ? "ready" : "failed");
    });
    return () => { cancelled = true; };
  }, []);

  const toggleType = (type: "project" | "core" | "risk") => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const typeConfig: Record<string, { color: string; label: string }> = {
    project: { color: T.cyan, label: "项目部" },
    core: { color: T.orange, label: "核心供应商" },
    risk: { color: T.red, label: "风险供应商" },
  };

  const option = useMemo(() => {
    const isProjectVisible = !hiddenTypes.has("project");
    const isCoreVisible = !hiddenTypes.has("core");
    const isRiskVisible = !hiddenTypes.has("risk");

    const projects = NODES.filter((n) => n.type === "project" && isProjectVisible).map((n) => ({
      name: n.name, value: [...n.coord, n.suppliers], info: n,
    }));
    const cores = NODES.filter((n) => n.type === "core" && isCoreVisible).map((n) => ({
      name: n.name, value: [...n.coord, 1], info: n,
    }));
    const risks = NODES.filter((n) => n.type === "risk" && isRiskVisible).map((n) => ({
      name: n.name, value: [...n.coord, 1], info: n,
    }));

    const normalLines: any[] = [];
    const riskLines: any[] = [];

    if (isProjectVisible) {
      const projectNodes = NODES.filter((n) => n.type === "project");
      const coreNodes = NODES.filter((n) => n.type === "core" && isCoreVisible);
      const riskNodes = NODES.filter((n) => n.type === "risk" && isRiskVisible);

      for (const proj of projectNodes) {
        if (!proj.links) continue;
        const targetNames = new Set(proj.links.coreSupplierNames ?? []);

        for (const core of coreNodes) {
          if (targetNames.has(core.name)) {
            normalLines.push({ coords: [core.coord, proj.coord] });
          }
        }

        const riskTargetNames = new Set(proj.links.riskSupplierNames ?? []);
        for (const risk of riskNodes) {
          if (riskTargetNames.has(risk.name)) {
            riskLines.push({ coords: [risk.coord, proj.coord] });
          }
        }
      }
    }

    const buildTooltip = (n: Node) => {
      if (n.type === "project") {
        return `<div style="min-width:240px;padding:4px 0;word-break:break-word;overflow-wrap:break-word">
          <div style="color:${T.cyan};font-weight:700;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${T.border};word-break:break-word;overflow-wrap:break-word">${n.name}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:7px 12px;font-size:11px;align-items:center;word-break:break-word;overflow-wrap:break-word">
            <span style="color:${T.textDim}">项目部名称</span><span style="color:${T.text};font-weight:500;word-break:break-word;overflow-wrap:break-word">${n.name}</span>
            <span style="color:${T.textDim}">合作供应商</span><span style="color:${T.cyanSoft};font-weight:600">${n.suppliers}家</span>
            <span style="color:${T.textDim}">地理位置</span><span style="color:${T.text};word-break:break-word;overflow-wrap:break-word">${n.region}</span>
            <span style="color:${T.textDim}">合同签订金额</span><span style="color:${T.orangeSoft}">${n.amount}</span>
            <span style="color:${T.textDim}">结算对账金额</span><span style="color:${T.green}">${n.settlement ?? "—"}</span>
          </div>
        </div>`;
      } else if (n.type === "core") {
        return `<div style="min-width:240px;padding:4px 0;word-break:break-word;overflow-wrap:break-word">
          <div style="color:${T.orange};font-weight:700;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,125,0,0.2);word-break:break-word;overflow-wrap:break-word">${n.name}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:7px 12px;font-size:11px;align-items:center;word-break:break-word;overflow-wrap:break-word">
            <span style="color:${T.textDim}">供应商名称</span><span style="color:${T.text};font-weight:500;word-break:break-word;overflow-wrap:break-word">${n.name}</span>
            <span style="color:${T.textDim}">供货状态</span><span style="color:${T.green};font-weight:600">${n.status ?? "正常"}</span>
            <span style="color:${T.textDim}">地理位置</span><span style="color:${T.text};word-break:break-word;overflow-wrap:break-word">${n.region}</span>
            <span style="color:${T.textDim}">合作项目数</span><span style="color:${T.cyanSoft}">${n.suppliers}家</span>
            <span style="color:${T.textDim}">合同签订金额</span><span style="color:${T.orangeSoft}">${n.amount}</span>
            <span style="color:${T.textDim}">结算对账金额</span><span style="color:${T.green}">${n.settlement ?? "—"}</span>
          </div>
        </div>`;
      } else {
        const reason = n.warningReason ?? "暂无预警详情";
        const maxLen = 80;
        const shortReason = reason.length > maxLen ? reason.slice(0, maxLen) + "…" : reason;
        _log('ControlTower.tsx:845','risk tooltip build',{name:n.name,origLen:reason.length,maxLen,shortLen:shortReason.length},'H3');
        return `<div style="min-width:220px;padding:4px 0;word-break:break-word;overflow-wrap:break-word">
          <div style="color:${T.red};font-weight:700;font-size:12px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(244,67,54,0.25);word-break:break-word;overflow-wrap:break-word">${n.name}</div>
          <div style="font-size:10px;line-height:1.9;color:${T.text};word-break:break-word;overflow-wrap:break-word">
            <div style="margin-bottom:6px"><span style="color:${T.textDim}">地理位置：</span><span style="color:${T.text};word-break:break-word;overflow-wrap:break-word">${n.region}</span></div>
            <div style="padding:8px 10px;background:rgba(244,67,54,0.08);border:1px solid rgba(244,67,54,0.2);border-radius:6px;word-break:break-word;overflow-wrap:break-word">
              <div style="color:${T.red};font-weight:600;margin-bottom:4px">预警原因</div>
              <div style="color:${T.text};line-height:1.7;word-break:break-word;overflow-wrap:break-word">${shortReason}</div>
            </div>
          </div>
        </div>`;
      }
    };

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(8,18,46,0.97)",
        borderColor: T.borderStrong,
        borderWidth: 1,
        padding: 14,
        textStyle: { color: T.text, fontSize: 12, wordBreak: "break-word" },
        extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px; max-width: 320px; word-break: break-word; overflow-wrap: break-word; white-space: normal;",
        position: function (point: number[], params: any, dom: HTMLElement, rect: any) {
          const [x, y] = point;
          const actualW = dom?.offsetWidth ?? 260;
          const actualH = dom?.offsetHeight ?? 200;
          const left = x + actualW > window.innerWidth ? x - actualW - 12 : x + 12;
          const top = y + actualH > window.innerHeight ? y - actualH - 12 : y + 12;
          _log('ControlTower.tsx:867','tooltip position',{rawX:x,rawY:y,winW:window.innerWidth,winH:window.innerHeight,calcLeft:left,calcTop:top,actualW,actualH,domW:dom?.offsetWidth,domH:dom?.offsetHeight},'H1-FIX-V2');
          return [left, top];
        },
        formatter: (p: any) => {
          const n: Node | undefined = p.data?.info;
          if (!n) return `<div style="color:${T.text}">${p.name}</div>`;
          _log('ControlTower.tsx:878','tooltip formatter',{nodeName:n.name,nodeType:n.type,hasWarning:!!n.warningReason,warningLen:n.warningReason?.length ?? 0},'H2');
          return buildTooltip(n);
        },
      },
      geo: {
        map: "china",
        roam: true,
        scaleLimit: { min: 0.8, max: 4 },
        zoom: 1.2,
        center: [105, 36],
        itemStyle: {
          areaColor: "rgba(41,182,246,0.06)",
          borderColor: "rgba(41,182,246,0.45)",
          borderWidth: 1,
          shadowColor: "rgba(41,182,246,0.5)",
          shadowBlur: 14,
        },
        emphasis: {
          itemStyle: { areaColor: "rgba(41,182,246,0.16)" },
          label: { color: T.cyanSoft },
        },
        label: { show: false },
        regions: [{ name: "南海诸岛", itemStyle: { areaColor: "transparent", borderColor: "transparent" }, label: { show: false } }],
      },
      series: [
        {
          name: "正常链路",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 1,
          lineStyle: { opacity: 0.6, curveness: 0.2 },
          effect: { show: true, period: 7, trailLength: 0.35, symbol: "circle", symbolSize: 2.5, color: T.cyanSoft },
          data: normalLines,
        },
        {
          name: "风险链路",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 2,
          lineStyle: { opacity: 0.8, width: 1.5, color: T.red },
          effect: { show: true, period: 4, trailLength: 0.5, symbol: "circle", symbolSize: 3, color: T.red },
          data: riskLines,
        },
        {
          name: "项目部",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 3 },
          symbolSize: 9,
          itemStyle: { color: T.cyan, shadowBlur: 10, shadowColor: T.cyan },
          label: { show: true, position: "right", color: T.text, fontSize: 10, formatter: (p: any) => p.name },
          data: projects,
        },
        {
          name: "核心供应商",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 12,
          itemStyle: { color: T.orange, shadowBlur: 14, shadowColor: T.orange },
          label: { show: false },
          data: cores,
        },
        {
          name: "风险供应商",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 5,
          rippleEffect: { brushType: "stroke", scale: 5 },
          symbolSize: 11,
          itemStyle: { color: T.red, shadowBlur: 16, shadowColor: T.red },
          label: { show: false },
          data: risks,
        },
      ],
    };
  }, [status, hiddenTypes]);

  const [nodeTypes] = useState<("project" | "core" | "risk")[]>(["project", "core", "risk"]);

  return (
    <div className="absolute inset-0">
      {status === "ready" ? (
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%", minHeight: 260 }}
          notMerge
          lazyUpdate
          opts={{ renderer: "canvas" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center gap-2" style={{ color: T.textDim, fontSize: 12 }}>
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: status === "failed" ? T.red : T.cyan }}
            />
            {status === "failed" ? "地图资源加载失败" : "正在加载中国地图…"}
          </div>
        </div>
      )}

      {/* 左上角两个图标按钮 */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => { setStatusOpen((v) => !v); if (!statusOpen) setSupplierTopOpen(false); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] transition-all duration-200"
          style={{
            background: statusOpen ? "rgba(41,182,246,0.22)" : T.panel,
            border: `1px solid ${statusOpen ? T.borderStrong : T.border}`,
            color: statusOpen ? T.cyanSoft : T.textDim,
            backdropFilter: "blur(12px)",
            boxShadow: `0 4px 16px rgba(0,0,0,0.4)${statusOpen ? `, 0 0 20px rgba(41,182,246,0.2)` : ""}`,
          }}
        >
          <Activity className="w-3.5 h-3.5" style={{ color: statusOpen ? T.cyan : T.textMuted }} />
          供应链网络实时状态
        </button>
        <button
          onClick={() => { setSupplierTopOpen((v) => !v); if (!supplierTopOpen) setStatusOpen(false); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] transition-all duration-200"
          style={{
            background: supplierTopOpen ? "rgba(255,125,0,0.22)" : T.panel,
            border: `1px solid ${supplierTopOpen ? "rgba(255,125,0,0.5)" : T.border}`,
            color: supplierTopOpen ? T.orangeSoft : T.textDim,
            backdropFilter: "blur(12px)",
            boxShadow: `0 4px 16px rgba(0,0,0,0.4)${supplierTopOpen ? `, 0 0 20px rgba(255,125,0,0.2)` : ""}`,
          }}
        >
          <Award className="w-3.5 h-3.5" style={{ color: supplierTopOpen ? T.orange : T.textMuted }} />
          核心供应商 TOP50
        </button>
      </div>

      <SupplyStatusOverlay open={statusOpen} onClose={() => setStatusOpen(false)} />
      <SupplierTopOverlay open={supplierTopOpen} onClose={() => setSupplierTopOpen(false)} />

      {/* 右下角图层切换 */}
      <div
        className="absolute bottom-3 right-3 rounded-xl px-3 py-2.5 z-10 flex flex-col gap-1.5"
        style={{
          background: "rgba(8,18,46,0.88)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ color: T.textMuted, fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>图层控制</div>
        {nodeTypes.map((t) => {
          const cfg = typeConfig[t];
          const isHidden = hiddenTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 text-[11px]"
              style={{
                background: isHidden ? "transparent" : `${cfg.color}12`,
                border: `1px solid ${isHidden ? "rgba(255,255,255,0.08)" : cfg.color + "40"}`,
                color: isHidden ? T.textMuted : cfg.color,
                opacity: isHidden ? 0.55 : 1,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isHidden ? "transparent" : cfg.color,
                  boxShadow: isHidden ? "none" : `0 0 6px ${cfg.color}`,
                  display: "inline-block",
                  border: isHidden ? `1px solid ${T.textMuted}` : "none",
                  flexShrink: 0,
                }}
              />
              <span style={{ textDecoration: isHidden ? "line-through" : "none" }}>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 中部视图二: 全国物流运输视图 ───────────────────────────────────────────

type TransportMode = "陆运" | "海运" | "空运";

type LogisticsNodeType = "project" | "core";

type LogisticsNode = {
  id: string;
  name: string;
  coord: [number, number];
  type: LogisticsNodeType;
  region: string;
  supplierCount?: number;
  supplyStatus?: "正常" | "延迟" | "风险";
  inventoryWarning?: "偏低" | "正常" | "充足";
  mainMaterial?: string;
  delayRoutes?: string[];
};

type LogisticsRoute = {
  id: string;
  mode: TransportMode;
  fromNode: string;
  toNode: string;
  waybillNo: string;
  vehiclePlate: string;
  location: string;
  cargo: string;
  scheduledDate: string;
  actualArrival?: string;
  delayDays: number;
  delay: boolean;
  delayReason?: string;
  inventoryWarning: "偏低" | "正常" | "充足";
  estimatedArrival?: string;
  /** 多段运输时每段的运单信息，格式: [{ mode, waybillNo, vehiclePlate, status }] */
  legs?: Array<{
    mode: TransportMode;
    waybillNo: string;
    vehiclePlate: string;
    /** "已完成" | "待运输" */
    status: "已完成" | "待运输";
  }>;
};

const logisticsNodes: LogisticsNode[] = [
  // 供应商节点（核心供应商）
  { id: "s1", name: "饶阳县润通铁路信号器材有限公司", coord: [115.72, 38.24], type: "core", region: "河北省衡水市饶阳县", supplyStatus: "正常", mainMaterial: "国标 HRB400E 螺纹钢" },
  { id: "s2", name: "贵州晟元天恒工程管理有限公司", coord: [106.71, 26.60], type: "core", region: "贵州省贵阳市", supplyStatus: "正常", mainMaterial: "国标 HRB400E 螺纹钢" },
  { id: "s3", name: "辽宁华信电气股份有限公司", coord: [123.43, 41.80], type: "core", region: "辽宁省沈阳市", supplyStatus: "正常", mainMaterial: "国标 HRB400E 螺纹钢" },
  { id: "s4", name: "扬州贝尔思达通信科技有限公司", coord: [119.42, 32.39], type: "core", region: "江苏省扬州市", supplyStatus: "正常", mainMaterial: "国标 HRB400E 螺纹钢" },
  // 核心供应商节点（供货状态为延迟）
  { id: "s5", name: "鑫方盛数智科技股份有限公司", coord: [116.46, 39.90], type: "core", region: "北京市大兴区", supplyStatus: "延迟", mainMaterial: "国标 HRB400E 螺纹钢", delayRoutes: ["r4"] },
  // 项目部节点
  { id: "p1", name: "贵阳桥路车间管内修建便道工程项目部", coord: [106.71, 26.60], type: "project", region: "贵州省贵阳市", supplierCount: 4, inventoryWarning: "正常" },
];

const logisticsRoutes: LogisticsRoute[] = [
  // 空运路线（从饶阳县供应商至贵阳项目部）
  {
    id: "r1", mode: "空运", fromNode: "s1", toNode: "p1",
    waybillNo: "YW20260528001", vehiclePlate: "顺丰航空 B-78G21",
    location: "饶阳县 → 空运至贵阳",
    cargo: "国标 HRB400E 螺纹钢",
    scheduledDate: "2026-06-05", delayDays: 0, delay: false,
    inventoryWarning: "正常",
    legs: [
      { mode: "陆运", waybillNo: "YW20260528001-L", vehiclePlate: "冀 T·78236 货运重卡", status: "已完成" },
      { mode: "空运", waybillNo: "YW20260528001-A", vehiclePlate: "顺丰航空 B-78G21", status: "待运输" },
    ],
  },
  // 海运路线
  {
    id: "r2", mode: "海运", fromNode: "s2", toNode: "p1",
    waybillNo: "YW20260528002", vehiclePlate: "振华号 货轮",
    location: "南海航线 — 贵阳港转陆运至项目工地", cargo: "国标 HRB400E 螺纹钢",
    scheduledDate: "2026-06-08", delayDays: 0, delay: false,
    inventoryWarning: "正常",
  },
  // 空运路线（辽宁华信电器至贵阳项目部：陆运+海运+空运三段式联运）
  {
    id: "r3", mode: "空运", fromNode: "s3", toNode: "p1",
    waybillNo: "YW20260528003", vehiclePlate: "多式联运",
    location: "沈阳 → 港口 → 空运至贵阳",
    cargo: "真空仪器",
    scheduledDate: "2026-06-02", delayDays: 0, delay: false,
    inventoryWarning: "正常",
    legs: [
      { mode: "陆运", waybillNo: "YW20260528003-L", vehiclePlate: "辽 A·88201 货运重卡", status: "已完成" },
      { mode: "海运", waybillNo: "YW20260528003-S", vehiclePlate: "中远海运号 货轮", status: "已完成" },
      { mode: "空运", waybillNo: "YW20260528003-A", vehiclePlate: "顺丰航空 B-78G21", status: "待运输" },
    ],
  },
  // 延迟路线
  {
    id: "r4", mode: "陆运", fromNode: "s5", toNode: "p1",
    waybillNo: "YW20260528004", vehiclePlate: "京 A·33902 货运重卡",
    location: "北京市大兴区 → 贵州省贵阳市（途径南方暴雨区域）", cargo: "国标 HRB400E 螺纹钢",
    scheduledDate: "2026-06-01", delayDays: 3, delay: true,
    delayReason: "受南方梅雨强降雨天气影响，道路临时封闭",
    inventoryWarning: "偏低", estimatedArrival: "2026-06-04",
  },
  {
    id: "r5", mode: "陆运", fromNode: "s4", toNode: "p1",
    waybillNo: "YW20260528005", vehiclePlate: "苏 A·55102 货运重卡",
    location: "江苏省扬州市 → 贵州省贵阳市", cargo: "国标 HRB400E 螺纹钢",
    scheduledDate: "2026-06-03", delayDays: 0, delay: false,
    inventoryWarning: "正常",
  },
];

const MODE_CONFIG: Record<TransportMode, { color: string; dimColor: string; label: string; icon: string }> = {
  "陆运": {
    color: "#5ec6ff",
    dimColor: "rgba(94,198,255,0.35)",
    label: "陆运",
    icon: "M-15,-6 L15,-6 L15,-3 L5,-3 L5,0 L15,0 L15,3 L-15,3 Z M-15,3 L-15,8 L-7,8 L-7,3 Z",
  },
  "海运": {
    color: "#29B6F6",
    dimColor: "rgba(41,182,246,0.35)",
    label: "海运",
    icon: "M0,-10 L12,6 L-12,6 Z M-10,6 L0,10 L10,6 Z",
  },
  "空运": {
    color: "#8b5cf6",
    dimColor: "rgba(139,92,246,0.35)",
    label: "空运",
    icon: "M0,-12 L4,-4 L12,-4 L4,2 L8,2 L0,10 L-8,2 L-4,2 L-12,-4 L-4,-4 Z",
  },
};

const buildNodeTooltip = (node: LogisticsNode): string => {
  if (node.type === "project") {
    const invColor = node.inventoryWarning === "偏低" ? T.red : node.inventoryWarning === "充足" ? T.green : T.orangeSoft;
    return `<div style="min-width:220px;padding:6px 0;word-break:break-word;overflow-wrap:break-word">
      <div style="color:${T.cyan};font-weight:700;font-size:12px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${T.border};word-break:break-word;overflow-wrap:break-word">${node.name}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:11px;align-items:center;word-break:break-word;overflow-wrap:break-word">
        <span style="color:${T.textDim}">项目部名称</span><span style="color:${T.text};font-weight:500;word-break:break-word">${node.name}</span>
        <span style="color:${T.textDim}">合作供应商</span><span style="color:${T.cyanSoft};font-weight:600">${node.supplierCount ?? 0} 家</span>
        <span style="color:${T.textDim}">地理位置</span><span style="color:${T.text};word-break:break-word">${node.region}</span>
        <span style="color:${T.textDim}">现场库存余量</span><span style="color:${invColor};font-weight:700">${node.inventoryWarning ?? "—"}</span>
      </div>
    </div>`;
  }
  const statusColor = node.supplyStatus === "正常" ? T.green : node.supplyStatus === "延迟" ? T.orangeSoft : T.red;
  return `<div style="min-width:220px;padding:6px 0;word-break:break-word;overflow-wrap:break-word">
    <div style="color:${T.orange};font-weight:700;font-size:12px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,125,0,0.2);word-break:break-word;overflow-wrap:break-word">${node.name}</div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:11px;align-items:center;word-break:break-word;overflow-wrap:break-word">
      <span style="color:${T.textDim}">供应商名称</span><span style="color:${T.text};font-weight:500;word-break:break-word">${node.name}</span>
      <span style="color:${T.textDim}">供货状态</span><span style="color:${statusColor};font-weight:600">${node.supplyStatus ?? "正常"}</span>
      <span style="color:${T.textDim}">地理位置</span><span style="color:${T.text};word-break:break-word">${node.region}</span>
      <span style="color:${T.textDim}">主要供应物料</span><span style="color:${T.orangeSoft}">${node.mainMaterial ?? "—"}</span>
    </div>
  </div>`;
};

const buildRoutePopup = (route: LogisticsRoute): string => {
  const modeCfg = MODE_CONFIG[route.mode];
  const delayInfo = route.delay ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(244,67,54,0.08);border:1px solid rgba(244,67,54,0.22);border-radius:6px">
      <div style="color:${T.red};font-weight:600;font-size:11px;margin-bottom:4px">异常信息</div>
      <div style="color:${T.textDim};font-size:10px;margin-bottom:4px">异常原因</div>
      <div style="color:${T.text};font-size:10px;line-height:1.6">${route.delayReason}</div>
      <div style="color:${T.textDim};font-size:10px;margin:6px 0 2px">预计到货时间</div>
      <div style="color:${T.red};font-weight:700;font-size:12px">${route.estimatedArrival ?? "—"} <span style="font-size:10px;font-weight:400;color:${T.red}">(+${route.delayDays} 天)</span></div>
    </div>` : "";
  const normalInfo = !route.delay ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(39,214,165,0.08);border:1px solid rgba(39,214,165,0.2);border-radius:6px">
      <div style="color:${T.green};font-weight:600;font-size:11px">实际到货时间：正常</div>
    </div>` : "";
  const invColor = route.inventoryWarning === "偏低" ? T.red : route.inventoryWarning === "充足" ? T.green : T.orangeSoft;

  if (route.legs && route.legs.length > 0) {
    const legsHtml = route.legs.map((leg, idx) => {
      const legCfg = MODE_CONFIG[leg.mode];
      const statusColor = leg.status === "已完成" ? T.green : T.orangeSoft;
      const isLast = idx === route.legs!.length - 1;
      const arrow = isLast ? "" : `<span style="color:${T.textMuted};margin:0 4px;font-size:10px">→</span>`;
      return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:14px;font-size:9px;font-weight:700;background:${legCfg.color}18;color:${legCfg.color};border:1px solid ${legCfg.color}40">${leg.mode}</span>
        <span style="color:${T.cyanSoft};font-size:9.5px;font-weight:600;word-break:break-all">${leg.waybillNo}</span>
        <span style="display:inline-flex;align-items:center;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:600;background:${statusColor}18;color:${statusColor};border:1px solid ${statusColor}40">${leg.status}</span>
        ${arrow}
      </div>`;
    }).join("");

    const overallStatus = route.legs.every((l) => l.status === "已完成")
      ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(39,214,165,0.08);border:1px solid rgba(39,214,165,0.2);border-radius:6px"><div style="color:${T.green};font-weight:600;font-size:11px">全程运输已完成</div></div>`
      : `<div style="margin-top:8px;padding:8px 10px;background:rgba(255,125,0,0.08);border:1px solid rgba(255,125,0,0.22);border-radius:6px"><div style="color:${T.orangeSoft};font-weight:600;font-size:11px;margin-bottom:4px">联运进行中</div><div style="color:${T.textDim};font-size:10px">部分路段 ${route.legs.filter((l) => l.status === "待运输").map((l) => l.mode).join("、")} 待运输</div></div>`;

    const legModes = [...new Set(route.legs.map((l) => l.mode))];
    const unifiedLabel = legModes.length === 1 ? legModes[0] : "多式联运";
    const labelColor = legModes.length === 1 ? MODE_CONFIG[legModes[0]].color : modeCfg.color;

    return `<div style="min-width:280px;word-break:break-word;overflow-wrap:break-word">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${T.border}">
        <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${labelColor}20;color:${labelColor};border:1px solid ${labelColor}50">${unifiedLabel}</span>
        <span style="color:${T.text};font-size:12px;font-weight:600">${route.cargo}</span>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 14px;font-size:10.5px;align-items:center;word-break:break-word">
        <span style="color:${T.textDim}">联运路线</span><span style="color:${T.text};font-size:10px">${route.location}</span>
        <span style="color:${T.textDim}">在运物料</span><span style="color:${T.orangeSoft}">${route.cargo}</span>
        <span style="color:${T.textDim}">原定计划到货</span><span style="color:${T.text}">${route.scheduledDate}</span>
        <span style="color:${T.textDim}">现场库存余量预警</span><span style="color:${invColor};font-weight:700">${route.inventoryWarning}</span>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid ${T.border}">
        <div style="color:${T.textDim};font-size:9px;font-weight:600;letter-spacing:0.5px;margin-bottom:6px;text-transform:uppercase">运输阶段</div>
        ${legsHtml}
      </div>
      ${overallStatus}${normalInfo}
    </div>`;
  }

  return `<div style="min-width:260px;word-break:break-word;overflow-wrap:break-word">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${T.border}">
      <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${modeCfg.color}20;color:${modeCfg.color};border:1px solid ${modeCfg.color}50">${route.mode}</span>
      <span style="color:${T.text};font-size:12px;font-weight:600">${route.cargo}</span>
    </div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 14px;font-size:10.5px;align-items:center;word-break:break-word">
      <span style="color:${T.textDim}">运单号</span><span style="color:${T.cyanSoft};font-weight:600;font-size:10px;word-break:break-all">${route.waybillNo}</span>
      <span style="color:${T.textDim}">承运方式</span><span style="color:${T.text}">${route.vehiclePlate}</span>
      <span style="color:${T.textDim}">实时地理位置</span><span style="color:${T.text};font-size:10px">${route.location}</span>
      <span style="color:${T.textDim}">在运物料</span><span style="color:${T.orangeSoft}">${route.cargo}</span>
      <span style="color:${T.textDim}">原定计划到货</span><span style="color:${T.text}">${route.scheduledDate}</span>
      <span style="color:${T.textDim}">现场库存余量预警</span><span style="color:${invColor};font-weight:700">${route.inventoryWarning}</span>
    </div>
    ${delayInfo}${normalInfo}
  </div>`;
};

function LayerControlPanel({ hiddenLayers, onToggle }: { hiddenLayers: Set<"project" | "core" | TransportMode>; onToggle: (l: "project" | "core" | TransportMode) => void }) {
  return (
    <div
      className="absolute bottom-3 right-3 rounded-xl px-3.5 py-3 z-10 flex flex-col gap-3"
      style={{
        background: "rgba(8,18,46,0.92)",
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(12px)",
        minWidth: 160,
      }}
    >
      {/* 节点图层 */}
      <div className="flex flex-col gap-1.5">
        <div style={{ color: T.textMuted, fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>图层 1 · 节点</div>
        {([
          { key: "project" as const, color: T.cyan, label: "项目部" },
          { key: "core" as const, color: T.orange, label: "核心供应商" },
        ]).map(({ key, color, label }) => {
          const isHidden = hiddenLayers.has(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 text-[11px]"
              style={{
                background: isHidden ? "transparent" : `${color}12`,
                border: `1px solid ${isHidden ? "rgba(255,255,255,0.08)" : color + "40"}`,
                color: isHidden ? T.textMuted : color,
                opacity: isHidden ? 0.55 : 1,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isHidden ? "transparent" : color,
                  boxShadow: isHidden ? "none" : `0 0 6px ${color}`,
                  display: "inline-block",
                  border: isHidden ? `1px solid ${T.textMuted}` : "none",
                  flexShrink: 0,
                }}
              />
              <span style={{ textDecoration: isHidden ? "line-through" : "none" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* 分隔线 */}
      <div style={{ height: 1, background: T.border, margin: "0 -4px" }} />

      {/* 运输方式图层 */}
      <div className="flex flex-col gap-1.5">
        <div style={{ color: T.textMuted, fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>图层 2 · 运输方式</div>
        {(["陆运", "海运", "空运"] as TransportMode[]).map((mode) => {
          const cfg = MODE_CONFIG[mode];
          const isHidden = hiddenLayers.has(mode);
          return (
            <button
              key={mode}
              onClick={() => onToggle(mode)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 text-[11px]"
              style={{
                background: isHidden ? "transparent" : `${cfg.color}12`,
                border: `1px solid ${isHidden ? "rgba(255,255,255,0.08)" : cfg.color + "40"}`,
                color: isHidden ? T.textMuted : cfg.color,
                opacity: isHidden ? 0.5 : 1,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isHidden ? "transparent" : cfg.color,
                  boxShadow: isHidden ? "none" : `0 0 6px ${cfg.color}`,
                  display: "inline-block",
                  border: isHidden ? `1px solid ${T.textMuted}` : "none",
                  flexShrink: 0,
                }}
              />
              <span style={{ textDecoration: isHidden ? "line-through" : "none" }}>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LogisticsMap() {
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<"project" | "core" | TransportMode>>(new Set());
  const [popupRoute, setPopupRoute] = useState<LogisticsRoute | null>(null);
  const [delayExpanded, setDelayExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadChinaMap().then((ok) => {
      if (cancelled) return;
      setMapStatus(ok ? "ready" : "failed");
    });
    return () => { cancelled = true; };
  }, []);

  const toggleLayer = (layer: "project" | "core" | TransportMode) => {
    setHiddenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const option = useMemo(() => {
    const isProjectVisible = !hiddenLayers.has("project");
    const isCoreVisible = !hiddenLayers.has("core");

    const visibleModes = (["陆运", "海运", "空运"] as TransportMode[]).filter(
      (m) => !hiddenLayers.has(m)
    );
    const visibleModeSet = new Set(visibleModes);

    const projectNodes = logisticsNodes
      .filter((n) => n.type === "project" && isProjectVisible)
      .map((n) => ({ name: n.name, value: n.coord, info: n }));

    const coreNodes = logisticsNodes
      .filter((n) => n.type === "core" && isCoreVisible)
      .map((n) => ({ name: n.name, value: n.coord, info: n }));

    const nodeById = (id: string) => logisticsNodes.find((n) => n.id === id)!;

    const normalLines: any[] = [];
    const riskLines: any[] = [];

    logisticsRoutes.forEach((r) => {
      if (!visibleModeSet.has(r.mode)) return;
      const fromNode = nodeById(r.fromNode);
      const toNode = nodeById(r.toNode);
      const coords: [[number, number], [number, number]] = [fromNode.coord, toNode.coord];

      if (r.delay) {
        riskLines.push({ coords, route: r });
      } else {
        normalLines.push({ coords, route: r });
      }
    });

    const series: any[] = [];

    if (normalLines.length > 0) {
      series.push({
        name: "正常链路",
        type: "lines",
        coordinateSystem: "geo",
        zlevel: 1,
        lineStyle: { opacity: 0.6, curveness: 0.2 },
        effect: { show: true, period: 7, trailLength: 0.35, symbol: "circle", symbolSize: 2.5, color: T.cyanSoft },
        data: normalLines,
      });
    }

    if (riskLines.length > 0) {
      series.push({
        name: "延迟线路",
        type: "lines",
        coordinateSystem: "geo",
        zlevel: 2,
        lineStyle: { opacity: 0.8, width: 1.5, color: T.red },
        effect: { show: true, period: 4, trailLength: 0.5, symbol: "circle", symbolSize: 3, color: T.red },
        data: riskLines,
      });
    }

    if (isProjectVisible) {
      series.push({
        name: "项目部",
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 4,
        rippleEffect: { brushType: "stroke", scale: 3 },
        symbolSize: 9,
        itemStyle: { color: T.cyan, shadowBlur: 10, shadowColor: T.cyan },
        label: { show: true, position: "right", color: T.text, fontSize: 10, formatter: (p: any) => p.name },
        data: projectNodes,
      });
    }
    if (isCoreVisible) {
      series.push({
        name: "核心供应商",
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 4,
        rippleEffect: { brushType: "stroke", scale: 4 },
        symbolSize: 12,
        itemStyle: { color: T.orange, shadowBlur: 14, shadowColor: T.orange },
        label: { show: false },
        data: coreNodes,
      });
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(8,18,46,0.97)",
        borderColor: T.borderStrong,
        borderWidth: 1,
        padding: 14,
        textStyle: { color: T.text, fontSize: 12, wordBreak: "break-word" },
        extraCssText: `box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px; max-width: 320px; word-break: break-word; overflow-wrap: break-word; white-space: normal;`,
        position: function (point: number[], _params: any, dom: HTMLElement, _rect: any) {
          const w = dom?.offsetWidth ?? 280;
          const h = dom?.offsetHeight ?? 200;
          const left = point[0] + w > window.innerWidth ? point[0] - w - 12 : point[0] + 12;
          const top = point[1] + h > window.innerHeight ? point[1] - h - 12 : point[1] + 12;
          return [left, top];
        },
        formatter: (p: any) => {
          if (p.seriesType === "lines") {
            const route = p.data?.route as LogisticsRoute | undefined;
            if (!route) return "";
            return buildRoutePopup(route);
          }
          const node = p.data?.info as LogisticsNode | undefined;
          if (!node) return `<div style="color:${T.text}">${p.name}</div>`;
          return buildNodeTooltip(node);
        },
      },
      geo: {
        map: "china",
        roam: true,
        scaleLimit: { min: 0.8, max: 4 },
        zoom: 1.2,
        center: [105, 36],
        itemStyle: {
          areaColor: "rgba(41,182,246,0.06)",
          borderColor: "rgba(41,182,246,0.45)",
          borderWidth: 1,
          shadowColor: "rgba(41,182,246,0.5)",
          shadowBlur: 14,
        },
        emphasis: {
          itemStyle: { areaColor: "rgba(41,182,246,0.16)" },
          label: { color: T.cyanSoft },
        },
        label: { show: false },
        regions: [{ name: "南海诸岛", itemStyle: { areaColor: "transparent", borderColor: "transparent" }, label: { show: false } }],
      },
      series,
    };
  }, [hiddenLayers, activeRoute, mapStatus]);

  const handleChartClick = (params: any) => {
    if (params.componentType === "series" && params.seriesType === "lines") {
      const route = params.data?.route as LogisticsRoute | undefined;
      if (!route) return;
      setActiveRoute((prev) => (prev === route.id ? null : route.id));
      setPopupRoute((prev) => (prev?.id === route.id ? null : route));
    }
  };

  const invColor = popupRoute
    ? popupRoute.inventoryWarning === "偏低"
      ? T.red
      : popupRoute.inventoryWarning === "充足"
      ? T.green
      : T.orangeSoft
    : T.text;

  const delayInfoBlock = popupRoute?.delay ? (
    <div style={{ marginTop: 10, padding: "10px", background: "rgba(244,67,54,0.07)", border: `1px solid rgba(244,67,54,0.2)`, borderRadius: 8 }}>
      <div style={{ color: T.red, fontWeight: 600, fontSize: 11, marginBottom: 6 }}>异常信息</div>
      <div style={{ color: T.textDim, fontSize: 10, marginBottom: 3 }}>异常原因</div>
      <div style={{ color: T.text, fontSize: 10, lineHeight: 1.65, marginBottom: 8 }}>{popupRoute.delayReason}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ color: T.textDim, fontSize: 9 }}>预计到货时间</div>
          <div style={{ color: T.red, fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{popupRoute.estimatedArrival}</div>
        </div>
        <div style={{ width: 1, height: 30, background: "rgba(244,67,54,0.2)" }} />
        <div>
          <div style={{ color: T.textDim, fontSize: 9 }}>延迟天数</div>
          <div style={{ color: T.red, fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>+{popupRoute.delayDays} 天</div>
        </div>
      </div>
    </div>
  ) : popupRoute ? (
    <div style={{ marginTop: 10, padding: "10px", background: "rgba(39,214,165,0.07)", border: `1px solid rgba(39,214,165,0.2)`, borderRadius: 8 }}>
      <div style={{ color: T.green, fontWeight: 600, fontSize: 11 }}>实际到货时间：正常</div>
    </div>
  ) : null;

  return (
    <div className="absolute inset-0">
      {mapStatus === "ready" ? (
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%", minHeight: 200 }}
          notMerge
          lazyUpdate
          opts={{ renderer: "canvas" }}
          onEvents={{ click: handleChartClick }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center gap-2" style={{ color: T.textDim, fontSize: 12 }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: mapStatus === "failed" ? T.red : T.cyan }} />
            {mapStatus === "failed" ? "地图资源加载失败" : "正在加载物流地图…"}
          </div>
        </div>
      )}

      {/* 左上角: 物流运输摘要面板 */}
      <div
        className="absolute top-3 left-3 z-10 rounded-xl px-3.5 py-3 max-w-[290px]"
        style={{
          background: "rgba(8,18,46,0.92)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b" style={{ borderColor: `${T.border}60` }}>
          <Navigation2 className="w-3.5 h-3.5" style={{ color: T.cyan }} />
          <span style={{ color: T.cyanSoft, fontSize: 11, fontWeight: 600 }}>物流运输动态</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} />
        </div>

        {/* 运输方式统计行 */}
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          {(["陆运", "海运", "空运"] as TransportMode[]).map((mode) => {
            const cfg = MODE_CONFIG[mode];
            const count = logisticsRoutes.filter((r) => r.mode === mode).length;
            const isHidden = hiddenLayers.has(mode);
            return (
              <button
                key={mode}
                onClick={() => toggleLayer(mode)}
                className="rounded-lg py-1.5 flex flex-col items-center gap-0.5 transition-all duration-200"
                style={{
                  background: isHidden ? "transparent" : `${cfg.color}10`,
                  border: `1px solid ${isHidden ? "rgba(255,255,255,0.07)" : cfg.color + "30"}`,
                  color: isHidden ? T.textMuted : cfg.color,
                  opacity: isHidden ? 0.5 : 1,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{isHidden ? "—" : count}</span>
                <span style={{ fontSize: 9 }}>{mode}</span>
              </button>
            );
          })}
        </div>

        {/* 延迟警告 */}
        {logisticsRoutes.some((r) => r.delay) && (
          <div style={{ marginBottom: 2 }}>
            <button
              onClick={() => setDelayExpanded((v) => !v)}
              className="w-full flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: T.red, fontSize: 9, fontWeight: 600, marginBottom: delayExpanded ? 4 : 0 }}
            >
              <span>延误预警 ({logisticsRoutes.filter((r) => r.delay).length})</span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center",
                  transition: "transform 200ms ease",
                  transform: delayExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M4 5.5L1 2h6L4 5.5z" />
                </svg>
              </span>
            </button>
            {delayExpanded && (
              <div className="space-y-1">
                {logisticsRoutes.filter((r) => r.delay).map((r) => {
                  const fromNode = logisticsNodes.find((n) => n.id === r.fromNode)!;
                  const toNode = logisticsNodes.find((n) => n.id === r.toNode)!;
                  return (
                    <button
                      key={r.id}
                      onClick={() => { setActiveRoute(r.id); setPopupRoute(r); }}
                      className="w-full text-left rounded-lg px-2 py-1.5 transition-all duration-200"
                      style={{
                        background: activeRoute === r.id ? "rgba(244,67,54,0.12)" : "rgba(244,67,54,0.05)",
                        border: `1px solid ${activeRoute === r.id ? "rgba(244,67,54,0.4)" : "rgba(244,67,54,0.15)"}`,
                      }}
                    >
                      <div style={{ color: T.text, fontSize: 10, fontWeight: 600, marginBottom: 1 }}>
                        {r.mode} · {r.vehiclePlate}
                      </div>
                      <div style={{ color: T.textDim, fontSize: 9 }}>
                        {fromNode.name} → {toNode.name}
                      </div>
                      <div style={{ color: T.red, fontSize: 9, fontWeight: 600, marginTop: 2 }}>
                        延误 +{r.delayDays} 天
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 运输线路详情弹窗 */}
      {popupRoute && (
        <div
          className="absolute z-20 rounded-xl px-3.5 py-3"
          style={{
            top: 12,
            right: 12,
            width: 270,
            background: "rgba(8,18,46,0.97)",
            border: `1px solid ${popupRoute.delay ? "rgba(244,67,54,0.4)" : T.borderStrong}`,
            backdropFilter: "blur(16px)",
            boxShadow: `0 0 30px ${popupRoute.delay ? "rgba(244,67,54,0.2)" : "rgba(41,182,246,0.15)"}, 0 8px 32px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: `${MODE_CONFIG[popupRoute.mode].color}20`,
                  color: MODE_CONFIG[popupRoute.mode].color,
                  border: `1px solid ${MODE_CONFIG[popupRoute.mode].color}50`,
                }}
              >
                {popupRoute.mode}
              </span>
              <span style={{ color: T.orangeSoft, fontSize: 11, fontWeight: 600 }}>
                {popupRoute.cargo}
              </span>
            </div>
            <button
              onClick={() => { setPopupRoute(null); setActiveRoute(null); }}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" style={{ color: T.textMuted }} />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>运单号</span>
              <span style={{ color: T.cyanSoft, fontWeight: 600, fontSize: 10, wordBreak: "break-all" }}>
                {popupRoute.waybillNo}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>承运方式</span>
              <span style={{ color: T.text, fontSize: 10 }}>{popupRoute.vehiclePlate}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>实时地理位置</span>
              <span style={{ color: T.text, fontSize: 10 }}>{popupRoute.location}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>在运物料</span>
              <span style={{ color: T.orangeSoft, fontSize: 10 }}>{popupRoute.cargo}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>原定计划到货</span>
              <span style={{ color: T.text, fontSize: 10 }}>{popupRoute.scheduledDate}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span style={{ color: T.textDim, fontSize: 10, flexShrink: 0 }}>现场库存余量</span>
              <span style={{ color: invColor, fontWeight: 700, fontSize: 10 }}>{popupRoute.inventoryWarning}</span>
            </div>
          </div>

          {delayInfoBlock}
        </div>
      )}

      {/* 图层控制面板 */}
      <LayerControlPanel hiddenLayers={hiddenLayers} onToggle={toggleLayer} />
    </div>
  );
}

// ─── 底部快捷入口 ───────────────────────────────────────────────────────────
const quickEntries = [
  { icon: Cloud, name: "铁建云租", amount: "¥86.2亿" },
  { icon: Store, name: "铁建商城", amount: "¥124.8亿" },
  { icon: Recycle, name: "循环物资", amount: "¥42.6亿" },
  { icon: Truck, name: "智慧物流", amount: "¥68.4亿" },
  { icon: Globe, name: "海外采购", amount: "¥38.9亿" },
  { icon: Plane, name: "智能商旅", amount: "¥12.6亿" },
];

function QuickEntries() {
  return (
    <div className="grid grid-cols-6 gap-2">
      {quickEntries.map((q) => {
        const Icon = q.icon;
        return (
          <button
            key={q.name}
            className="group rounded-[14px] py-2.5 transition-all duration-200 hover:border-[rgba(41,182,246,0.45)]"
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              boxShadow: `0 0 0 1px rgba(41,182,246,0.04) inset, 0 2px 12px rgba(0,0,0,0.3)`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: "rgba(41,182,246,0.1)",
                  color: T.cyan,
                  boxShadow: "0 0 10px rgba(41,182,246,0.2)",
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span style={{ color: T.text, fontSize: 11 }}>{q.name}</span>
              <span style={{ color: T.orangeSoft, fontSize: 10, fontWeight: 600 }}>{q.amount}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── 右侧模块 1: 价格监控中心 ───────────────────────────────────────────────
function PriceMonitor() {
  const [filters, setFilters] = useState<PriceFilterState>({
    material: "钢筋",
    package: "",
    spec: "HRB400E",
    timeRange: "月",
    province: "",
    city: "",
  });
  const option = {
    grid: { left: 0, right: 52, top: 8, bottom: 0, containLabel: true },
    tooltip: { trigger: "axis", backgroundColor: "rgba(8,18,46,0.95)", borderColor: T.borderStrong, textStyle: { color: T.text } },
    xAxis: { type: "value", show: false, max: 5000 },
    yAxis: {
      type: "category",
      data: ["市场零售价", "战采协议价"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: T.text, fontSize: 11 },
    },
    series: [{
      type: "bar",
      barWidth: 14,
      data: [
        {
          value: 4260,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: T.orange },
              { offset: 1, color: T.red },
            ]),
            borderRadius: [0, 7, 7, 0],
          },
        },
        {
          value: 3860,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: T.green },
              { offset: 1, color: T.cyan },
            ]),
            borderRadius: [0, 7, 7, 0],
          },
        },
      ],
      label: { show: true, position: "right", color: T.text, fontSize: 11, formatter: "¥{c}" },
    }],
  };

  return (
    <Panel title="价格中心" extra={
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} />
        <span style={{ color: T.textDim, fontSize: 10 }}>实时行情</span>
      </div>
    }>
      <PriceFilterBar filters={filters} onChange={setFilters} />
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "战采协议价", value: "3,860", unit: "元/吨", color: T.green },
          { label: "钢材网实时", value: "4,260", unit: "元/吨", color: T.orange },
          { label: "水泥网实时", value: "1,860", unit: "元/吨", color: T.cyan },
        ].map((p) => (
          <div key={p.label} className="rounded-xl p-2.5 text-center" style={{ background: `${p.color}10`, border: `1px solid ${p.color}30` }}>
            <div style={{ color: p.color, fontSize: 14, fontWeight: 700 }}>{p.value}</div>
            <div style={{ color: T.textDim, fontSize: 10 }}>{p.label}</div>
            <div style={{ color: T.textMuted, fontSize: 9 }}>{p.unit}</div>
          </div>
        ))}
      </div>
      <div style={{ color: T.text, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
        螺纹钢价格对比（元/吨）
      </div>
      <ReactECharts option={option} style={{ height: 88 }} />
      <div className="flex items-center gap-3 mt-1.5 text-[10px]">
        <span style={{ color: T.textDim }}>
          价差 <span style={{ color: T.red, fontWeight: 600 }}>¥400/吨</span>
        </span>
        <span style={{ color: T.textDim }}>
          当月同比 <span style={{ color: T.red, fontWeight: 600 }}>↓4.2%</span>
        </span>
      </div>
    </Panel>
  );
}

// ─── 右侧模块 2: 全场景采购风险预警 ─────────────────────────────────────────
const warnings = [
  { label: "采购计划编制异常", count: 38, sub: "逾期未启动", color: T.red },
  { label: "线下寻源不合规", count: 21, sub: "流程异常", color: T.orange },
  { label: "大宗物资价格异动", count: 56, sub: "价格暴涨", color: T.red },
  { label: "合同履约逾期", count: 14, sub: "到期/违约", color: T.orange },
];

function RiskCenter() {
  return (
    <Panel
      title="全场景采购风险预警"
      extra={
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: T.red }} />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.red }} />
        </div>
      }
    >
      <div className="space-y-2">
        {warnings.map((w) => (
          <div
            key={w.label}
            className="rounded-xl p-2.5 flex items-start gap-3 cursor-pointer transition-all duration-200 hover:border-[rgba(244,67,54,0.4)]"
            style={{
              background: `${w.color}08`,
              border: `1px solid ${w.color}25`,
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span style={{ color: T.text, fontSize: 11 }}>{w.label}</span>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0 mt-1"
                  style={{ background: w.color, boxShadow: `0 0 6px ${w.color}` }}
                />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span style={{ color: w.color, fontSize: 20, fontWeight: 700 }}>{w.count}</span>
                <span style={{ color: T.textDim, fontSize: 10 }}>{w.sub}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: T.textMuted }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200"
          style={{
            background: "rgba(244,67,54,0.1)",
            border: "1px solid rgba(244,67,54,0.3)",
            color: T.red,
          }}
        >
          <Shield className="w-3 h-3" />
          风险溯源
        </button>
      </div>
    </Panel>
  );
}

// ─── 右侧模块 3: AI 智能采购决策建议 ─────────────────────────────────────────
function AISuggestion() {
  const [states, setStates] = useState<Record<string, "idle" | "executing" | "done">>({});

  const exec = (key: string) => {
    setStates((s) => ({ ...s, [key]: "executing" }));
    setTimeout(() => setStates((s) => ({ ...s, [key]: "done" })), 1800);
  };

  const execAll = () => {
    exec("plan");
    setTimeout(() => exec("purchase"), 400);
  };

  const planState = states["plan"] ?? "idle";
  const purchaseState = states["purchase"] ?? "idle";
  const allDone = planState === "done" && purchaseState === "done";

  const suggestions = [
    {
      key: "plan",
      num: 1,
      title: "计划提报建议",
      titleColor: T.cyan,
      bgColor: "rgba(41,182,246,0.06)",
      borderColor: T.border,
      content: (
        <>
          <span style={{ color: T.orange }}>济滨高铁项目部</span>已完成现场入场备案，系统自动匹配同类历史项目采购模型，建议一键生成配套物资采购计划。
        </>
      ),
    },
    {
      key: "purchase",
      num: 2,
      title: "采购触发建议",
      titleColor: T.orange,
      bgColor: "rgba(255,125,0,0.06)",
      borderColor: "rgba(255,125,0,0.22)",
      content: (
        <>
          系统监测到<span style={{ color: T.orange }}>螺纹钢 HRB400E</span>连续5个月价格上涨，
          <span style={{ color: T.orange }}>雄安高铁项目</span>现场备品库存告急，建议触发 AI 采购智能体批量集采。
        </>
      ),
    },
  ];

  return (
    <Panel
      title="AI 智能采购决策建议"
      extra={<Sparkles className="w-3.5 h-3.5" style={{ color: T.orange }} />}
    >
      <div className="space-y-2.5">
        {suggestions.map((s) => {
          const sState = states[s.key] ?? "idle";
          return (
            <div
              key={s.key}
              className="rounded-xl p-3 transition-all duration-200"
              style={{
                background: s.bgColor,
                border: `1px solid ${sState === "done" ? T.green : s.borderColor}`,
                boxShadow: sState === "done" ? `0 0 16px rgba(39,214,165,0.2)` : "none",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold"
                  style={{
                    background: sState === "done" ? T.green : s.titleColor,
                    color: "#061325",
                  }}
                >
                  {sState === "done" ? "✓" : s.num}
                </span>
                <span style={{ color: s.titleColor, fontSize: 12, fontWeight: 600 }}>{s.title}</span>
                {sState === "executing" && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-auto" style={{ background: s.titleColor }} />
                )}
              </div>
              <div style={{ color: T.text, fontSize: 11, lineHeight: 1.7 }}>
                {s.content}
              </div>
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => exec(s.key)}
                  disabled={sState !== "idle"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
                  style={{
                    background:
                      sState === "done"
                        ? "rgba(39,214,165,0.15)"
                        : sState === "executing"
                        ? `${s.titleColor}15`
                        : `${s.titleColor}12`,
                    border: `1px solid ${
                      sState === "done"
                        ? T.green
                        : sState === "executing"
                        ? s.titleColor
                        : `${s.titleColor}50`
                    }`,
                    color: sState === "done" ? T.green : s.titleColor,
                    cursor: sState !== "idle" ? "default" : "pointer",
                    boxShadow: sState === "done" ? `0 0 12px rgba(39,214,165,0.3)` : "none",
                  }}
                >
                  {sState === "idle" && <Sparkles className="w-3 h-3" />}
                  {sState === "executing" && (
                    <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  )}
                  {sState === "done" && <Activity className="w-3 h-3" />}
                  {sState === "idle" ? "立即执行" : sState === "executing" ? "执行中…" : "已执行"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={execAll}
          disabled={allDone || planState === "executing" || purchaseState === "executing"}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200"
          style={{
            background: allDone
              ? "rgba(39,214,165,0.12)"
              : planState === "executing" || purchaseState === "executing"
              ? "rgba(41,182,246,0.06)"
              : "rgba(41,182,246,0.14)",
            border: `1px solid ${
              allDone
                ? T.green
                : planState === "executing" || purchaseState === "executing"
                ? "rgba(41,182,246,0.25)"
                : T.borderStrong
            }`,
            color: allDone ? T.green : T.cyanSoft,
            cursor: allDone || planState === "executing" || purchaseState === "executing" ? "default" : "pointer",
            boxShadow: allDone ? `0 0 16px rgba(39,214,165,0.3)` : "none",
          }}
        >
          {allDone ? (
            <><Activity className="w-3.5 h-3.5" />全部已执行</>
          ) : planState === "executing" || purchaseState === "executing" ? (
            <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />执行中…</>
          ) : (
            <><Zap className="w-3.5 h-3.5" />一键执行全部</>
          )}
        </button>
      </div>
    </Panel>
  );
}

// ─── Dashboard 标签页切换 ────────────────────────────────────────────────────
type DashTab = "topology" | "logistics";
const DASH_TABS: { key: DashTab; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { key: "topology", label: "供应链全域拓扑网络视图", icon: Layers },
  { key: "logistics", label: "全国物资物流运输视图", icon: Package },
];

// ─── 主组件 ─────────────────────────────────────────────────────────────────
export function ControlTower() {
  const now = useMemo(() => {
    return new Date().toLocaleString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    });
  }, []);

  const [activeTab, setActiveTab] = useState<DashTab>("topology");

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ background: T.bg, color: T.text, minHeight: "100dvh" }}
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(41,182,246,0.10) 0%, transparent 55%), linear-gradient(180deg, #061325 0%, #08122E 60%, #04101e 100%)`,
      }} />
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(rgba(41,182,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(41,182,246,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 顶部状态栏 */}
      <div
        className="relative flex items-center justify-between px-6 py-3 border-b z-10"
        style={{ borderColor: T.border }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: T.green,
              boxShadow: `0 0 8px ${T.green}`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: T.cyanSoft, fontSize: 11 }}>系统运行正常</span>
          <span style={{ color: T.textMuted, fontSize: 11 }}>|</span>
          <span style={{ color: T.textDim, fontSize: 11 }}>数据更新于 {now}</span>
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ color: T.text, fontSize: 17, fontWeight: 700, letterSpacing: 3 }}
        >
          中铁建供应链控制塔 · 数字化管控中心
        </div>
        <div style={{ color: T.textDim, fontSize: 11 }}>{now}</div>
      </div>

      {/* Dashboard 标签栏 */}
      <div
        className="relative flex items-center gap-1 px-5 py-2.5 border-b z-10"
        style={{ borderColor: "rgba(41,182,246,0.10)", background: "rgba(8,18,46,0.5)" }}
      >
        <div className="flex items-center gap-1.5">
          {DASH_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? "rgba(41,182,246,0.16)" : "transparent",
                  border: `1px solid ${isActive ? T.borderStrong : "transparent"}`,
                  color: isActive ? T.cyanSoft : T.textDim,
                  boxShadow: isActive ? `0 0 16px rgba(41,182,246,0.15)` : "none",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? T.cyan : T.textMuted }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative flex-1 flex flex-col overflow-hidden z-10 p-3 gap-3">
        {/* 主体三列 */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">

          {/* 左列 */}
          <div className="col-span-3 flex flex-col gap-3 overflow-auto hide-scrollbar">
            <PurchaseStatsCard />
            <DemandForecastCard />
            <RatesCard />
            <SupplierCard />
          </div>

          {/* 中列 */}
          <div className="col-span-6 flex flex-col gap-3 min-h-0">
            <TopMetricsBar />

            {/* 地图区域 */}
            <div
              className="flex-1 relative rounded-[14px] overflow-hidden min-h-0"
              style={{
                background: "linear-gradient(180deg, rgba(8,20,38,0.6), rgba(4,16,30,0.9))",
                border: `1px solid ${T.border}`,
                boxShadow: `0 0 0 1px rgba(41,182,246,0.04) inset, 0 0 40px rgba(41,182,246,0.08) inset, 0 4px 32px rgba(0,0,0,0.5)`,
              }}
            >
              {/* 地图内容 */}
              <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: activeTab === "topology" ? 1 : 0, pointerEvents: activeTab === "topology" ? "auto" : "none" }}>
                <TopologyMap />
              </div>
              <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: activeTab === "logistics" ? 1 : 0, pointerEvents: activeTab === "logistics" ? "auto" : "none" }}>
                <LogisticsMap />
              </div>
            </div>

            <QuickEntries />
          </div>

          {/* 右列 */}
          <div className="col-span-3 flex flex-col gap-3 overflow-auto hide-scrollbar">
            <PriceMonitor />
            <RiskCenter />
            <AISuggestion />
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px currentColor; }
          50% { box-shadow: 0 0 16px currentColor; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
