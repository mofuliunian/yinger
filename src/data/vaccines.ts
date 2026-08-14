export interface VaccineDose {
  key: string
  vaccine: string
  doseLabel: string // 如「第1剂」
  month: number // 计划接种月龄
  selfPaid?: boolean
  note?: string
}

/**
 * 国家免疫规划疫苗（2025 年版程序）+ 常见自费疫苗。
 * 计划日期 = 出生日期 + month 个月，仅供提醒参考，请以社区接种门诊安排为准。
 */
export const VACCINE_SCHEDULE: VaccineDose[] = [
  { key: 'hepb-1', vaccine: '乙肝疫苗', doseLabel: '第1剂', month: 0, note: '出生 24 小时内接种' },
  { key: 'bcg-1', vaccine: '卡介苗', doseLabel: '第1剂', month: 0, note: '出生后尽早接种' },
  { key: 'hepb-2', vaccine: '乙肝疫苗', doseLabel: '第2剂', month: 1 },
  { key: 'polio-1', vaccine: '脊灰疫苗（IPV）', doseLabel: '第1剂', month: 2 },
  { key: 'dtap-1', vaccine: '百白破疫苗', doseLabel: '第1剂', month: 2 },
  { key: 'polio-2', vaccine: '脊灰疫苗（IPV）', doseLabel: '第2剂', month: 3 },
  { key: 'polio-3', vaccine: '脊灰疫苗', doseLabel: '第3剂', month: 4 },
  { key: 'dtap-2', vaccine: '百白破疫苗', doseLabel: '第2剂', month: 4 },
  { key: 'hepb-3', vaccine: '乙肝疫苗', doseLabel: '第3剂', month: 6 },
  { key: 'dtap-3', vaccine: '百白破疫苗', doseLabel: '第3剂', month: 6 },
  { key: 'mena-1', vaccine: 'A群流脑多糖疫苗', doseLabel: '第1剂', month: 6 },
  { key: 'mmr-1', vaccine: '麻腮风疫苗', doseLabel: '第1剂', month: 8 },
  { key: 'je-1', vaccine: '乙脑减毒活疫苗', doseLabel: '第1剂', month: 8 },
  { key: 'mena-2', vaccine: 'A群流脑多糖疫苗', doseLabel: '第2剂', month: 9 },
  { key: 'mmr-2', vaccine: '麻腮风疫苗', doseLabel: '第2剂', month: 18 },
  { key: 'hepa-1', vaccine: '甲肝减毒活疫苗', doseLabel: '第1剂', month: 18 },
  { key: 'dtap-4', vaccine: '百白破疫苗', doseLabel: '第4剂', month: 18 },
  { key: 'je-2', vaccine: '乙脑减毒活疫苗', doseLabel: '第2剂', month: 24 },
  { key: 'menac-1', vaccine: 'A+C群流脑多糖疫苗', doseLabel: '第1剂', month: 36 },
  { key: 'polio-4', vaccine: '脊灰疫苗', doseLabel: '第4剂', month: 48 },
  { key: 'dtap-5', vaccine: '百白破疫苗', doseLabel: '第5剂', month: 72 },
  { key: 'menac-2', vaccine: 'A+C群流脑多糖疫苗', doseLabel: '第2剂', month: 72 },

  // 常见自费疫苗
  { key: 'pcv13-1', vaccine: '13价肺炎球菌疫苗', doseLabel: '第1剂', month: 2, selfPaid: true },
  { key: 'pcv13-2', vaccine: '13价肺炎球菌疫苗', doseLabel: '第2剂', month: 4, selfPaid: true },
  { key: 'pcv13-3', vaccine: '13价肺炎球菌疫苗', doseLabel: '第3剂', month: 6, selfPaid: true },
  { key: 'pcv13-4', vaccine: '13价肺炎球菌疫苗', doseLabel: '加强', month: 12, selfPaid: true },
  { key: 'penta-1', vaccine: '五联疫苗', doseLabel: '第1剂', month: 2, selfPaid: true, note: '替代脊灰+百白破+Hib，与免费程序二选一' },
  { key: 'penta-2', vaccine: '五联疫苗', doseLabel: '第2剂', month: 3, selfPaid: true },
  { key: 'penta-3', vaccine: '五联疫苗', doseLabel: '第3剂', month: 4, selfPaid: true },
  { key: 'penta-4', vaccine: '五联疫苗', doseLabel: '第4剂', month: 18, selfPaid: true },
  { key: 'rota-1', vaccine: '轮状病毒疫苗（五价）', doseLabel: '第1剂', month: 2, selfPaid: true, note: '口服' },
  { key: 'rota-2', vaccine: '轮状病毒疫苗（五价）', doseLabel: '第2剂', month: 4, selfPaid: true, note: '口服' },
  { key: 'rota-3', vaccine: '轮状病毒疫苗（五价）', doseLabel: '第3剂', month: 6, selfPaid: true, note: '口服' },
  { key: 'ev71-1', vaccine: '手足口疫苗（EV71）', doseLabel: '第1剂', month: 6, selfPaid: true },
  { key: 'ev71-2', vaccine: '手足口疫苗（EV71）', doseLabel: '第2剂', month: 7, selfPaid: true, note: '与第1剂间隔1个月' },
  { key: 'flu-1', vaccine: '流感疫苗', doseLabel: '每年', month: 6, selfPaid: true, note: '6月龄起每年秋季接种' },
  { key: 'vzv-1', vaccine: '水痘疫苗', doseLabel: '第1剂', month: 12, selfPaid: true, note: '部分地区免费' },
  { key: 'vzv-2', vaccine: '水痘疫苗', doseLabel: '第2剂', month: 48, selfPaid: true },
]
