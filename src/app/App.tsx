import { useRef, useState } from "react";
import { Bell, Search, Menu, Gauge, ShoppingCart, FileText, Users, BarChart3, Settings, Maximize2, Minimize2, ChevronsLeft, ChevronsRight, ChevronDown, Building2, UserCircle2 } from "lucide-react";
import { TopTabs, ModuleKey } from "./components/ProcurementTabs";
import { PlanModule } from "./components/modules/PlanModule";
import { ProjectModule, RateModule, ContractModule, SettleModule } from "./components/modules/OtherModules";
import { BriefingPanel } from "./components/BriefingPanel";
import { ControlTower } from "./components/dashboard/ControlTower";

type ViewKey = "dashboard" | "procurement" | "contract-mgmt" | "supplier" | "analysis" | "settings";

type NavGroup = {
  group: string;
  items: { key: ViewKey; icon: any; label: string }[];
};

const NAV: NavGroup[] = [
  {
    group: "概览",
    items: [
      { key: "dashboard", icon: Gauge, label: "仪表盘" },
    ],
  },
  {
    group: "业务管理",
    items: [
      { key: "procurement", icon: ShoppingCart, label: "采购管理" },
      { key: "contract-mgmt", icon: FileText, label: "合同管理" },
      { key: "supplier", icon: Users, label: "供应商" },
    ],
  },
  {
    group: "分析与配置",
    items: [
      { key: "analysis", icon: BarChart3, label: "数据分析" },
      { key: "settings", icon: Settings, label: "系统设置" },
    ],
  },
];

const ORGS = [
  { value: "group", label: "中铁建集团（总部）" },
  { value: "north", label: "中铁建华北公司" },
  { value: "east", label: "中铁建华东公司" },
  { value: "south", label: "中铁建华南公司" },
  { value: "southwest", label: "中铁建西南公司" },
  { value: "northwest", label: "中铁建西北公司" },
  { value: "northeast", label: "中铁建东北公司" },
];

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [active, setActive] = useState<ModuleKey>("plan");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [org, setOrg] = useState(ORGS[0].value);
  const dashRef = useRef<HTMLDivElement>(null);

  const isDashboard = view === "dashboard";

  const toggleFullscreen = async () => {
    const el = dashRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((v) => !v);
    }
  };

  return (
    <div className="size-full min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-16" : "w-56"} bg-gradient-to-b from-[#0b2447] via-[#0d2a55] to-[#0a1f3f] text-slate-200 flex-col transition-[width] duration-200 relative`}
      >
        {/* Brand */}
        <div className={`px-3 py-4 border-b border-white/5 flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-4"}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-900/40" style={{ fontWeight: 700 }}>采</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white truncate" style={{ fontSize: 14, fontWeight: 600 }}>采购管理系统</div>
              <div className="text-[11px] text-slate-400 truncate">企业采购数据平台</div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-2 py-3 overflow-auto">
          {NAV.map((g) => (
            <div key={g.group} className="mb-3">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[10px] tracking-wider text-slate-400/70 uppercase">{g.group}</div>
              )}
              <div className="space-y-0.5">
                {g.items.map((n) => {
                  const Icon = n.icon;
                  const isActive = view === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => setView(n.key)}
                      title={collapsed ? n.label : undefined}
                      className={`w-full flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} py-2 rounded-md text-sm transition relative ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/25 to-blue-500/5 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-blue-400" />}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-300" : ""}`} />
                      {!collapsed && <span className="truncate">{n.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / user */}
        <div className={`border-t border-white/5 px-2 py-3 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center">
              <UserCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center flex-shrink-0">
                <UserCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">林静</div>
                <div className="text-[11px] text-slate-400 truncate">采购管理员</div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "展开" : "收起"}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center z-10"
        >
          {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between gap-4">
          <button className="md:hidden text-slate-500"><Menu className="w-5 h-5" /></button>

          {/* Org selector */}
          <div className="relative">
            <div className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer">
              <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer pr-5 appearance-none"
                style={{ minWidth: 180 }}
              >
                {ORGS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-5 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 text-sm border border-transparent focus:border-blue-300 focus:bg-white focus:outline-none" placeholder="搜索计划、合同、供应商…" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-md bg-slate-50 hover:bg-slate-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center" style={{ fontWeight: 600 }}>林</div>
          </div>
        </header>

        {/* Content */}
        {isDashboard ? (
          <div ref={dashRef} className="relative flex-1 overflow-auto bg-[#04101e]">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "退出最大化" : "最大化"}
              className="absolute top-4 right-4 z-50 w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <div className="w-full" style={{ aspectRatio: "16 / 9", minHeight: isFullscreen ? "100vh" : "calc(100vh - 64px)" }}>
              <ControlTower />
            </div>
          </div>
        ) : view === "procurement" ? (
          <div className="flex-1 overflow-auto p-6 space-y-5">
            <TopTabs active={active} onChange={setActive} />
            <div className="rounded-2xl">
              {active === "plan" && <PlanModule />}
              {active === "project" && <ProjectModule />}
              {active === "rate" && <RateModule />}
              {active === "contract" && <ContractModule />}
              {active === "settle" && <SettleModule />}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                <span className="text-slate-800" style={{ fontSize: 15, fontWeight: 600 }}>智能简报与决策建议</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">实时</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">导出</button>
                <button className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">订阅推送</button>
              </div>
            </div>
            <BriefingPanel />
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center text-slate-400 text-sm">
            模块开发中…
          </div>
        )}
      </main>
    </div>
  );
}
