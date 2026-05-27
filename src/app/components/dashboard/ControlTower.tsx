import React, { useEffect, useMemo, useState } from "react";
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
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const trends: Record<string, number[]> = {
    "采购计划金额": [180,195,188,200,205,210,195,220,215,218,225,218],
    "采购寻源金额": [150,162,158,168,172,178,165,185,180,186,192,186],
    "采购合同金额": [130,145,140,150,155,160,148,165,160,162,168,162],
    "采购结算金额": [100,108,105,112,115,118,110,122,120,125,130,128],
  };

  return (
    <Panel title="采购交易">
      <div className="grid grid-cols-2 gap-2.5">
        {purchaseStats.map((s) => (
          <div
            key={s.label}
            className="relative rounded-xl p-3 cursor-pointer transition-all duration-200"
            style={{
              background: hovered === s.label ? "rgba(41,182,246,0.14)" : "rgba(41,182,246,0.06)",
              border: `1px solid ${hovered === s.label ? T.borderStrong : "rgba(41,182,246,0.15)"}`,
              boxShadow: hovered === s.label ? `0 0 16px rgba(41,182,246,0.2) inset` : "none",
            }}
            onMouseEnter={() => setHovered(s.label)}
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

            {/* 悬浮趋势图 */}
            {hovered === s.label && trends[s.label] && (
              <div
                className="absolute left-0 right-0 bottom-full z-50 mb-2 rounded-xl p-3"
                style={{
                  background: "rgba(8,18,46,0.96)",
                  border: `1px solid ${T.borderStrong}`,
                  boxShadow: `0 0 30px rgba(41,182,246,0.25)`,
                  backdropFilter: "blur(16px)",
                }}
              >
                <div style={{ color: T.cyanSoft, fontSize: 11, marginBottom: 8, fontWeight: 600 }}>
                  近12个月趋势
                </div>
                <ReactECharts
                  option={{
                    grid: { left: 0, right: 0, top: 4, bottom: 20, containLabel: true },
                    tooltip: {
                      trigger: "axis",
                      backgroundColor: "rgba(8,18,46,0.95)",
                      borderColor: T.borderStrong,
                      textStyle: { color: T.text, fontSize: 10 },
                    },
                    xAxis: { type: "category", data: months, axisLine: { lineStyle: { color: "rgba(41,182,246,0.2)" } }, axisLabel: { color: T.textDim, fontSize: 9 }, splitLine: { show: false } },
                    yAxis: { type: "value", show: false },
                    series: [{
                      type: "line",
                      data: trends[s.label],
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
                  }}
                  style={{ height: 80 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
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

// ─── 左侧模块 3: 采购四率 ───────────────────────────────────────────────────
const ratesData = [
  { name: "公开采购达成率", value: 96, color: T.cyan },
  { name: "集中寻源采购率", value: 97, color: T.orange },
  { name: "合同在线备案率", value: 98, color: T.green },
];

function RatesCard() {
  return (
    <Panel title="采购四率">
      <div className="grid grid-cols-3 gap-2">
        {ratesData.map((r) => {
          const option = {
            series: [{
              type: "gauge",
              startAngle: 90,
              endAngle: -270,
              radius: "90%",
              pointer: { show: false },
              progress: {
                show: true, overlap: false, roundCap: true, clip: false, width: 9,
                itemStyle: {
                  color: r.color,
                  shadowBlur: 10,
                  shadowColor: r.color,
                },
              },
              axisLine: { lineStyle: { width: 9, color: [[1, "rgba(41,182,246,0.10)"]] } },
              splitLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              data: [{ value: r.value }],
              detail: {
                valueAnimation: false,
                formatter: "{value}%",
                color: r.color,
                fontSize: 16,
                fontWeight: 700,
                offsetCenter: [0, 0],
              },
            }],
          };
          return (
            <div key={r.name} className="flex flex-col items-center">
              <ReactECharts option={option} style={{ width: 80, height: 80 }} />
              <div className="-mt-1 text-center leading-tight" style={{ color: T.text, fontSize: 10 }}>
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
const HUB: [number, number] = [108.95, 34.27];

type Node = {
  name: string; coord: [number, number];
  type: "project" | "core" | "risk";
  region: string; suppliers: number; amount: string;
};

const NODES: Node[] = [
  { name: "济滨高铁", coord: [116.99, 36.65], type: "core", region: "国家级重大基建·山东省", suppliers: 48, amount: "128亿" },
  { name: "北京枢纽", coord: [116.40, 39.90], type: "project", region: "重点项目·北京", suppliers: 36, amount: "86亿" },
  { name: "成渝中线", coord: [104.06, 30.67], type: "core", region: "重大项目·四川", suppliers: 42, amount: "112亿" },
  { name: "粤港澳枢纽", coord: [113.27, 23.13], type: "project", region: "区域项目·广东", suppliers: 28, amount: "64亿" },
  { name: "雄安新区", coord: [116.07, 38.97], type: "core", region: "重大项目·河北", suppliers: 56, amount: "186亿" },
  { name: "乌鲁木齐", coord: [87.62, 43.83], type: "project", region: "供应基地·新疆", suppliers: 18, amount: "32亿" },
  { name: "上海钢材", coord: [121.47, 31.23], type: "core", region: "核心供应商·上海", suppliers: 62, amount: "210亿" },
  { name: "武汉水泥", coord: [114.30, 30.59], type: "project", region: "供应基地·湖北", suppliers: 24, amount: "52亿" },
  { name: "天津贸易", coord: [117.20, 39.13], type: "risk", region: "风险节点·天津", suppliers: 0, amount: "—" },
  { name: "郑州物流", coord: [113.65, 34.76], type: "risk", region: "风险节点·河南", suppliers: 0, amount: "—" },
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
  { name: "上海宝山钢铁集团", amount: "¥21.4亿" },
  { name: "中铁电气化局", amount: "¥18.6亿" },
  { name: "三一重工股份", amount: "¥16.2亿" },
  { name: "海螺水泥集团", amount: "¥14.8亿" },
  { name: "中联重科科技", amount: "¥12.6亿" },
  { name: "徐工机械集团", amount: "¥11.2亿" },
  { name: "中天科技股份", amount: "¥9.8亿" },
  { name: "中天钢铁集团", amount: "¥8.6亿" },
  { name: "华润水泥控股", amount: "¥7.4亿" },
  { name: "正泰电气股份", amount: "¥6.9亿" },
];

function StatusOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute top-14 left-4 w-[260px] z-20"
    >
      <Panel
        title="供应链实时状态"
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
            { label: "异常风险链路", value: "3.6%", color: T.red },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span style={{ color: T.textDim }}>{item.label}</span>
              <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
          <div className="h-px my-2" style={{ background: T.border }} />
          <div style={{ color: T.text, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>核心供应商 TOP10</div>
          <div className="space-y-1 max-h-[220px] overflow-auto pr-1">
            {topRanking.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: i < 3 ? "rgba(255,125,0,0.18)" : "rgba(41,182,246,0.12)",
                      color: i < 3 ? T.orange : T.cyan,
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate" style={{ color: T.text }}>{t.name}</span>
                </div>
                <span style={{ color: T.cyanSoft }}>{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function TopologyMap() {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadChinaMap().then((ok) => {
      if (cancelled) return;
      setStatus(ok ? "ready" : "failed");
    });
    return () => { cancelled = true; };
  }, []);

  const option = useMemo(() => {
    const projects = NODES.filter((n) => n.type === "project").map((n) => ({
      name: n.name, value: [...n.coord, n.suppliers], info: n,
    }));
    const cores = NODES.filter((n) => n.type === "core").map((n) => ({
      name: n.name, value: [...n.coord, n.suppliers], info: n,
    }));
    const risks = NODES.filter((n) => n.type === "risk").map((n) => ({
      name: n.name, value: [...n.coord, 1], info: n,
    }));
    const lines = NODES.map((n) => ({
      coords: [HUB, n.coord],
      lineStyle: { color: n.type === "risk" ? T.red : T.cyan },
    }));
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(8,18,46,0.95)",
        borderColor: T.borderStrong,
        borderWidth: 1,
        padding: 12,
        textStyle: { color: T.text, fontSize: 12 },
        formatter: (p: any) => {
          const n: Node | undefined = p.data?.info;
          if (!n) return `<div style="color:${T.text}">${p.name}</div>`;
          return `<div style="min-width:180px"><div style="color:${T.cyan};font-weight:600;margin-bottom:4px">${n.name}</div><div style="color:${T.textDim};font-size:11px">${n.region}</div><div style="margin-top:6px;padding-top:6px;border-top:1px solid ${T.border}"><span style="color:${T.text}">关联供应商 </span><span style="color:${T.cyanSoft};font-weight:600">${n.suppliers} 家</span><span style="color:${T.textDim}}> · </span><span style="color:${T.orangeSoft}">${n.amount}</span></div></div>`;
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
          name: "采供连线",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 2,
          effect: {
            show: true, period: 6, trailLength: 0.4,
            symbol: "circle", symbolSize: 3, color: T.cyanSoft,
          },
          lineStyle: { width: 1, opacity: 0.6, curveness: 0.25 },
          data: lines,
        },
        {
          name: "总部调度中心",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 14,
          itemStyle: { color: T.cyan, shadowBlur: 14, shadowColor: T.cyan },
          label: {
            show: true, position: "top", color: T.cyanSoft,
            fontSize: 11, fontWeight: 700, formatter: "总部调度中心",
          },
          data: [{ name: "总部", value: [...HUB, 999] }],
        },
        {
          name: "项目部",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 3 },
          symbolSize: 8,
          itemStyle: { color: T.cyan, shadowBlur: 8, shadowColor: T.cyan },
          label: { show: true, position: "right", color: T.text, fontSize: 10, formatter: (p: any) => p.name },
          data: projects,
        },
        {
          name: "核心供应商",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 14,
          itemStyle: { color: T.orange, shadowBlur: 14, shadowColor: T.orange },
          label: { show: true, position: "right", color: T.orangeSoft, fontSize: 11, fontWeight: 600, formatter: (p: any) => p.name },
          data: cores,
        },
        {
          name: "风险节点",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 4,
          rippleEffect: { brushType: "stroke", scale: 5 },
          symbolSize: 10,
          itemStyle: { color: T.red, shadowBlur: 14, shadowColor: T.red },
          label: { show: true, position: "right", color: T.red, fontSize: 10, formatter: (p: any) => p.name },
          data: risks,
        },
      ],
    };
  }, [status]);

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
      <button
        onClick={() => setStatusOpen((v) => !v)}
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200"
        style={{
          background: T.panel,
          border: `1px solid ${statusOpen ? T.borderStrong : T.border}`,
          color: T.cyanSoft,
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
        }}
      >
        <Activity className="w-3.5 h-3.5" />
        实时状态
      </button>
      <StatusOverlay open={statusOpen} onClose={() => setStatusOpen(false)} />
      <div
        className="absolute bottom-3 right-3 rounded-xl px-3.5 py-2 flex items-center gap-4 z-10"
        style={{
          background: "rgba(8,18,46,0.88)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        {[
          { color: T.cyan, label: "普通项目部", size: "small" },
          { color: T.orange, label: "核心供应商", size: "medium" },
          { color: T.red, label: "风险节点", size: "small" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: T.textDim }}>
            <i className="rounded-full" style={{
              background: l.color,
              width: l.size === "medium" ? 8 : 6,
              height: l.size === "medium" ? 8 : 6,
              boxShadow: `0 0 6px ${l.color}`,
            }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── 中部视图二: 全国物流运输视图 ───────────────────────────────────────────
const logisticsNodes = [
  { name: "上海宝山钢材基地", coord: [121.47, 31.23], type: "supplier" as const },
  { name: "广州南沙港仓库", coord: [113.35, 22.80], type: "supplier" as const },
  { name: "济滨高铁项目部", coord: [116.99, 36.65], type: "project" as const },
  { name: "雄安高铁项目部", coord: [116.07, 38.97], type: "project" as const },
  { name: "成渝中线项目部", coord: [104.06, 30.67], type: "project" as const },
];

const logisticsRoutes = [
  { from: [121.47, 31.23], to: [116.99, 36.65], vehicle: "豫 A**** 货运重卡", location: "河南省郑州市高速路段", cargo: "国标 HRB400E 螺纹钢", scheduledDate: "2023-11-18", delayReason: "受南方梅雨强降雨天气影响", weather: "暴雨", temperature: "18°C", humidity: "89%", delayDays: 3, delay: true, inventoryWarning: "偏低" },
];

function LogisticsMap() {
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [activeRoute, setActiveRoute] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadChinaMap().then((ok) => {
      if (cancelled) return;
      setMapStatus(ok ? "ready" : "failed");
    });
    return () => { cancelled = true; };
  }, []);

  const option = useMemo(() => {
    const suppliers = logisticsNodes.filter((n) => n.type === "supplier").map((n) => ({
      name: n.name, value: n.coord,
    }));
    const projects = logisticsNodes.filter((n) => n.type === "project").map((n) => ({
      name: n.name, value: n.coord,
    }));
    const routeLines = logisticsRoutes.map((r, i) => ({
      coords: [r.from, r.to],
      lineStyle: {
        color: r.delay ? T.red : T.orange,
        width: 2,
        opacity: activeRoute === null || activeRoute === i ? 1 : 0.35,
      },
      name: String(i),
    }));
    const routePoints = logisticsRoutes.flatMap((r, i) => [
      { name: `起${i}`, value: r.from },
      { name: `终${i}`, value: r.to },
    ]);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(8,18,46,0.95)",
        borderColor: T.borderStrong,
        borderWidth: 1,
        padding: 12,
        textStyle: { color: T.text, fontSize: 12 },
        formatter: (p: any) => {
          if (p.seriesType === "lines") {
            const idx = parseInt(p.name);
            const r = logisticsRoutes[idx];
            return `<div style="min-width:200px"><div style="color:${T.orangeSoft};font-weight:600;margin-bottom:6px">${r.cargo}</div><div style="color:${T.textDim};font-size:11px;margin-bottom:3px">承运车辆：<span style="color:${T.text}">${r.vehicle}</span></div><div style="color:${T.textDim};font-size:11px">状态：<span style="color:${r.delay ? T.red : T.green};font-weight:600">${r.delay ? "延误 " + r.delayDays + " 天" : "正常"}</span></div></div>`;
          }
          return `<div style="color:${T.cyanSoft}">${p.name}</div>`;
        },
      },
      geo: {
        map: "china",
        roam: true,
        scaleLimit: { min: 0.8, max: 4 },
        zoom: 1.15,
        center: [108, 34],
        itemStyle: {
          areaColor: "rgba(41,182,246,0.04)",
          borderColor: "rgba(41,182,246,0.3)",
          borderWidth: 1,
        },
        label: { show: false },
        regions: [{ name: "南海诸岛", itemStyle: { areaColor: "transparent", borderColor: "transparent" }, label: { show: false } }],
      },
      series: [
        {
          name: "物流路线",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 2,
          effect: {
            show: true, period: 4, trailLength: 0.2,
            symbol: "path://M-12,-7 L10,-7 L10,-4 L3,-4 L3,0 L10,0 L10,3 L-12,3 Z M-12,3 L-12,7 L-5,7 L-5,3 Z",
            symbolSize: 12, color: T.orangeSoft,
          },
          lineStyle: { width: 2.5, opacity: 1 },
          data: routeLines,
        },
        {
          name: "货车轨迹",
          type: "lines",
          coordinateSystem: "geo",
          zlevel: 3,
          effect: {
            show: true, period: 4, trailLength: 0.6,
            symbol: "path://M-12,-7 L10,-7 L10,-4 L3,-4 L3,0 L10,0 L10,3 L-12,3 Z M-12,3 L-12,7 L-5,7 L-5,3 Z",
            symbolSize: 14, color: T.orange,
          },
          lineStyle: { width: 0, opacity: 0 },
          data: routeLines,
        },
        {
          name: "供应商",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 4 },
          symbolSize: 12,
          itemStyle: { color: T.orange, shadowBlur: 12, shadowColor: T.orange },
          label: { show: true, position: "top", color: T.orangeSoft, fontSize: 10, fontWeight: 600, formatter: (p: any) => p.name },
          data: suppliers,
        },
        {
          name: "项目部",
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 3,
          rippleEffect: { brushType: "stroke", scale: 3 },
          symbolSize: 9,
          itemStyle: { color: T.cyan, shadowBlur: 8, shadowColor: T.cyan },
          label: { show: true, position: "right", color: T.text, fontSize: 10, formatter: (p: any) => p.name },
          data: projects,
        },
      ],
    };
  }, [activeRoute, mapStatus]);

  return (
    <div className="absolute inset-0">
      {mapStatus === "ready" ? (
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%", minHeight: 200 }}
          notMerge
          lazyUpdate
          opts={{ renderer: "canvas" }}
          onEvents={{ click: (params: any) => {
            if (params.componentType === "series" && params.seriesType === "lines") {
              const idx = parseInt(params.name);
              setActiveRoute((prev) => (prev === idx ? null : idx));
            }
          }}}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center gap-2" style={{ color: T.textDim, fontSize: 12 }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.cyan }} />
            正在加载物流地图…
          </div>
        </div>
      )}
      {/* 物流信息浮窗 */}
      <div
        className="absolute top-3 left-3 z-10 rounded-xl px-3.5 py-2.5 max-w-[280px]"
        style={{
          background: "rgba(8,18,46,0.92)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Navigation2 className="w-3.5 h-3.5" style={{ color: T.orange }} />
          <span style={{ color: T.orangeSoft, fontSize: 11, fontWeight: 600 }}>物流运输动态</span>
        </div>
        <div className="space-y-1.5">
          {logisticsRoutes.map((r, i) => (
            <div
              key={i}
              className="cursor-pointer transition-all rounded-lg p-2"
              style={{
                background: activeRoute === i ? "rgba(255,125,0,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeRoute === i ? "rgba(255,125,0,0.3)" : "transparent"}`,
              }}
              onClick={() => setActiveRoute((prev) => (prev === i ? null : i))}
            >
              <div className="flex items-center gap-1.5 mb-2 pb-2 border-b" style={{ borderColor: `${T.border}60` }}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: r.delay ? T.red : T.orange }} />
                <span style={{ color: T.text, fontSize: 10, fontWeight: 600 }}>{r.vehicle}</span>
                <span className="ml-auto" style={{ color: T.textDim, fontSize: 9 }}>{r.location}</span>
              </div>

              <div className="space-y-1 px-1 mb-2">
                <div className="flex items-center justify-between">
                  <span style={{ color: T.textMuted, fontSize: 9 }}>在运物料:</span>
                  <span style={{ color: T.text, fontSize: 9 }}>{r.cargo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: T.textMuted, fontSize: 9 }}>原定到货:</span>
                  <span style={{ color: T.text, fontSize: 9 }}>{r.scheduledDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: T.textMuted, fontSize: 9 }}>现场库存:</span>
                  <span style={{ color: T.red, fontSize: 9, fontWeight: 600 }}>{r.inventoryWarning}</span>
                </div>
              </div>

              <div
                className="rounded-md p-2"
                style={{ background: "rgba(255,80,80,0.08)", border: `1px solid rgba(255,80,80,0.2)` }}
              >
                <div className="flex items-center gap-1 mb-1.5">
                  <Cloud className="w-3 h-3" style={{ color: T.cyan }} />
                  <span style={{ color: T.textMuted, fontSize: 9 }}>{r.delayReason}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: T.red, fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{r.weather}</span>
                    <div className="flex flex-col">
                      <span style={{ color: T.textMuted, fontSize: 8 }}>{r.temperature}</span>
                      <span style={{ color: T.textMuted, fontSize: 8 }}>湿度 {r.humidity}</span>
                    </div>
                  </div>
                  <div className="flex-1 border-t" style={{ borderColor: "rgba(255,80,80,0.2)" }} />
                  <div className="text-right">
                    <div style={{ color: T.red, fontSize: 11, fontWeight: 700 }}>+{r.delayDays} 天</div>
                    <div style={{ color: T.textMuted, fontSize: 8 }}>延迟到货</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute bottom-3 right-3 rounded-xl px-3.5 py-2 flex items-center gap-4 z-10"
        style={{
          background: "rgba(8,18,46,0.88)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: T.textDim }}>
          <i className="w-2 h-2 rounded-full" style={{ background: T.orange, boxShadow: `0 0 6px ${T.orange}` }} />
          物资供应商
        </span>
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: T.textDim }}>
          <i className="w-2 h-2 rounded-full" style={{ background: T.cyan, boxShadow: `0 0 6px ${T.cyan}` }} />
          项目施工部
        </span>
      </div>
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
        <div className="flex items-center gap-1.5 mr-2 pr-2" style={{ borderRight: `1px solid ${T.border}` }}>
          <Layers className="w-3.5 h-3.5" style={{ color: T.cyan }} />
          <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>仪表盘</span>
        </div>
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

            {/* 视图标签指示 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {DASH_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200"
                      style={{
                        background: activeTab === tab.key ? "rgba(41,182,246,0.12)" : "transparent",
                        border: `1px solid ${activeTab === tab.key ? T.border : "transparent"}`,
                        color: activeTab === tab.key ? T.cyanSoft : T.textMuted,
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ color: T.textMuted, fontSize: 10 }}>
                拖拽地图可缩放 · 点击节点查看详情
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
