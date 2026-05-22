import { useMemo, useState } from "react";
import { Sparkles, FileBarChart, Settings2, Check, TrendingUp } from "lucide-react";
import { MODULES, ModuleKey } from "./ProcurementTabs";

const BRIEFINGS: Record<ModuleKey, { title: string; bullets: string[] }> = {
  plan: {
    title: "采购计划本月简报",
    bullets: [
      "本月新增计划 312 单，金额 ¥18.6M，环比 +12.4%",
      "计划执行率 86.4%，较上月提升 3.1pp",
      "重点物料：钢材-Q235B 占总额 18.7%",
      "5 单计划逾期未启动，需重点跟进",
    ],
  },
  project: {
    title: "采购立项本月简报",
    bullets: [
      "本月立项 142 单，申报金额 ¥12.8M",
      "审批通过率 94.2%，平均审批时长 3.6 天",
      "公开招标占比 37.4%，邀请招标 25.0%",
      "1 笔大额立项 ¥3.2M（厂区改造）进入决策审批",
    ],
  },
  rate: {
    title: "采购四率本月简报",
    bullets: [
      "计划达成率 92.6% / 招标完成率 88.3%",
      "合同签订率 95.1%，结算及时率 86.4%",
      "四率综合分较上月提升 1.4pp",
      "结算及时率仍低于目标线 90%，需优化付款流程",
    ],
  },
  contract: {
    title: "合同本月简报",
    bullets: [
      "本月签订合同 128 份，总金额 ¥21.5M",
      "履约中合同 412 份，履约率 93.7%",
      "30 天内到期 12 份，建议提前续签",
      "重点乙方：深圳前海物流集团 ¥3.42M",
    ],
  },
  settle: {
    title: "结算本月简报",
    bullets: [
      "结算金额 ¥10.8M，环比 +8.7%",
      "已支付 ¥9.2M，支付率 85.2%",
      "应付未付 ¥1.6M，涉及 86 家供应商",
      "平均结算周期 18.2 天，较上月缩短 1.5 天",
    ],
  },
};

const AI_CONCLUSIONS: Record<ModuleKey, { score: number; level: string; items: string[] }> = {
  plan: {
    score: 86,
    level: "良好",
    items: [
      "整体计划执行健康度处于良好区间，关键指标稳步提升。",
      "建议关注钢材类计划的集中采购窗口，预计可节约 4-6% 成本。",
      "5 单逾期计划集中在工程部，建议触发 SLA 预警通知。",
    ],
  },
  project: {
    score: 91,
    level: "优秀",
    items: [
      "立项审批效率持续提升，AI 评估当前流程已接近最优。",
      "建议对单一来源采购加强合规审查，规避潜在风险。",
      "工程类项目立项金额波动较大，建议加强预算管控。",
    ],
  },
  rate: {
    score: 88,
    level: "良好",
    items: [
      "四率综合表现优秀，整体趋势向好。",
      "结算及时率为短板，建议核心供应商引入电子发票直连。",
      "招标完成率与合同签订率高度正相关，可联动管控。",
    ],
  },
  contract: {
    score: 92,
    level: "优秀",
    items: [
      "合同履约稳定，违约风险整体可控（低风险）。",
      "12 份临到期合同建议在 7 个工作日内启动续签或终止流程。",
      "建议对前 5 大供应商建立年度战略合作框架协议。",
    ],
  },
  settle: {
    score: 84,
    level: "良好",
    items: [
      "现金流压力中等，建议优化付款节奏以维持供应商关系。",
      "AI 预测下月结算金额约 ¥11.5M，请提前安排资金。",
      "建议对部分支付订单设置自动催办与提醒机制。",
    ],
  },
};

export function BriefingPanel() {
  const [selected, setSelected] = useState<ModuleKey>("plan");
  const brief = useMemo(() => BRIEFINGS[selected], [selected]);
  const ai = useMemo(() => AI_CONCLUSIONS[selected], [selected]);
  const moduleName = MODULES.find((m) => m.key === selected)?.title;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 左侧：本月简报 */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <FileBarChart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-800">本月简报</div>
              <div className="text-xs text-slate-400">数据来源：{moduleName}</div>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-md bg-slate-50 text-slate-500">2026-05</span>
        </div>
        <div className="text-slate-700 mb-3" style={{ fontWeight: 500 }}>{brief.title}</div>
        <ul className="space-y-3.5">
          {brief.bullets.map((b, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2.5 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧区域：分主次堆叠 */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* 主：AI 结论 */}
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 rounded-2xl p-5 shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-200/30 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between mb-4 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white text-indigo-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-800 flex items-center gap-1.5">AI 智能结论
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500 text-white">实时</span>
                </div>
                <div className="text-xs text-slate-500">基于 {moduleName} 数据智能分析</div>
              </div>
            </div>
          </div>
          <ul className="space-y-3 relative">
            {ai.items.map((t, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2.5 leading-relaxed">
                <span className="mt-0.5 w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-indigo-100/70 flex items-center text-[11px] text-slate-400/80 relative">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-indigo-300/70" /> 由 AI 自动生成，结论仅供参考</span>
          </div>
        </div>

        {/* 次：模板配置（横向紧凑） */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center">
                <Settings2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-800 text-sm">模板配置</div>
                <div className="text-[11px] text-slate-400">选择业务模块自动生成简报与 AI 结论</div>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs transition">
              一键生成
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {MODULES.map((m) => {
              const isSel = selected === m.key;
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelected(m.key)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    isSel ? "bg-blue-50 border-blue-300" : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${isSel ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className={`text-xs truncate ${isSel ? "text-blue-600" : "text-slate-600"}`}>{m.title}</span>
                  {isSel && <Check className="w-3 h-3 text-blue-500 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
