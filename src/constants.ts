import type { Colleague, Task, TaskColor } from './types'

export const MS_PER_DAY = 1000 * 60 * 60 * 24
export const CELL_WIDTH = 120
export const ROW_MIN_HEIGHT = 80
export const TASK_HEIGHT = 36
export const TASK_GAP = 4
export const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
export const EXTEND_DAYS = 30
export const EDGE_THRESHOLD = 600
export const NAME_COL_WIDTH = 224

// 直式模式常數
export const V_ROW_HEIGHT = 52
export const V_COL_WIDTH = 180
export const V_TASK_WIDTH = 140
export const V_DATE_COL_WIDTH = 100

export const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

export const TASK_COLORS: TaskColor[] = [
  { bg: 'bg-blue-200 border-blue-400 text-blue-900', dot: '#93c5fd' },
  { bg: 'bg-red-200 border-red-400 text-red-900', dot: '#fca5a5' },
  { bg: 'bg-amber-200 border-amber-400 text-amber-900', dot: '#fcd34d' },
  { bg: 'bg-green-200 border-green-400 text-green-900', dot: '#86efac' },
  { bg: 'bg-teal-200 border-teal-400 text-teal-900', dot: '#5eead4' },
  { bg: 'bg-purple-200 border-purple-400 text-purple-900', dot: '#d8b4fe' },
  { bg: 'bg-pink-200 border-pink-400 text-pink-900', dot: '#f9a8d4' },
  { bg: 'bg-orange-200 border-orange-400 text-orange-900', dot: '#fdba74' },
]

export const INITIAL_COLLEAGUES: Colleague[] = [
  { id: 'c1', name: '王老師', role: '課程研發' },
  { id: 'c2', name: '林老師', role: '行為分析' },
  { id: 'c3', name: '陳治療師', role: '職能治療' },
]

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: '編寫適應體育教案', color: 'bg-blue-200 border-blue-400 text-blue-900', assigneeId: 'c1', startDate: '2026-03-23', endDate: '2026-03-26', duration: 4, deadline: null },
  { id: 't2', title: '設計行為介入方案(BIP)', color: 'bg-red-200 border-red-400 text-red-900', assigneeId: 'c2', startDate: '2026-03-24', endDate: '2026-03-25', duration: 2, deadline: null },
  { id: 't3', title: '跨專業團隊個案研討會', color: 'bg-amber-200 border-amber-400 text-amber-900', assigneeId: 'c1', startDate: '2026-03-25', endDate: '2026-03-25', duration: 1, deadline: null },
  { id: 't4', title: '感覺統合教具採購評估', color: 'bg-green-200 border-green-400 text-green-900', assigneeId: null, startDate: null, endDate: null, duration: 3, deadline: null },
  { id: 't5', title: '情境圖卡視覺教材繪製', color: 'bg-teal-200 border-teal-400 text-teal-900', assigneeId: null, startDate: null, endDate: null, duration: 2, deadline: null },
]
