import { Calendar, Crosshair, Columns2 } from 'lucide-react'
import type { ViewMode } from '../types'

interface ToolbarProps {
  dateRange: string
  viewMode: ViewMode
  onScrollToToday: () => void
  onToggleView: () => void
}

export default function Toolbar({ dateRange, viewMode, onScrollToToday, onToggleView }: ToolbarProps) {
  return (
    <div className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0">
      <h1 className="text-xl font-bold flex items-center space-x-2">
        <Calendar className="text-gray-600 w-6 h-6" />
        <span>長期專案排程甘特圖</span>
      </h1>
      <div className="flex items-center space-x-3">
        <div className="font-mono text-sm text-gray-500">{dateRange}</div>
        <button
          onClick={onScrollToToday}
          className="px-3 py-1.5 hover:bg-blue-50 rounded text-blue-600 border border-blue-200 shadow-sm text-sm font-bold flex items-center space-x-1"
        >
          <Crosshair className="w-4 h-4" />
          <span>今天</span>
        </button>
        <button
          onClick={onToggleView}
          className="px-3 py-1.5 hover:bg-gray-100 rounded text-gray-600 border shadow-sm text-sm font-bold flex items-center space-x-1"
        >
          <Columns2 className="w-4 h-4" />
          <span>{viewMode === 'horizontal' ? '直式' : '橫式'}</span>
        </button>
      </div>
    </div>
  )
}
