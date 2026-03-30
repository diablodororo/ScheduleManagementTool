import { User, Pencil, Copy } from 'lucide-react'
import type { Colleague, Task } from '../types'
import {
  V_ROW_HEIGHT, V_COL_WIDTH, V_TASK_WIDTH, V_DATE_COL_WIDTH,
  DAY_NAMES, TODAY,
} from '../constants'
import { formatDate, parseDate, getDaysDiff, addDays } from '../utils/date'
import { getColleagueLanes } from '../utils/lanes'

interface VerticalViewProps {
  colleagues: Colleague[]
  tasks: Task[]
  timelineStart: Date
  timelineEnd: Date
  resizingTaskId: string | null
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDrop: (e: React.DragEvent, assigneeId: string, dateStr: string) => void
  onInitResize: (e: React.MouseEvent, taskId: string, direction: string) => void
  onEditTask: (taskId: string) => void
  onDuplicateTask: (taskId: string) => void
}

export default function VerticalView({
  colleagues, tasks, timelineStart, timelineEnd, resizingTaskId,
  onDragStart, onDrop, onInitResize, onEditTask, onDuplicateTask,
}: VerticalViewProps) {
  const totalDays = getDaysDiff(timelineStart, timelineEnd)
  const viewDays = Array.from({ length: totalDays }).map((_, i) => addDays(timelineStart, i))
  const todayStr = formatDate(TODAY)

  const getColWidth = (colleagueId: string) => {
    const { totalLanes } = getColleagueLanes(colleagueId, tasks)
    return Math.max(V_COL_WIDTH, totalLanes * (V_TASK_WIDTH + 8) + 16)
  }

  const handleCellDragOver = (e: React.DragEvent, cellId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    document.getElementById(cellId)?.classList.add('drag-over-zone')
  }

  const handleCellDragLeave = (e: React.DragEvent, cellId: string) => {
    e.preventDefault()
    document.getElementById(cellId)?.classList.remove('drag-over-zone')
  }

  const handleCellDrop = (e: React.DragEvent, assigneeId: string, dateStr: string, cellId: string) => {
    e.preventDefault()
    document.getElementById(cellId)?.classList.remove('drag-over-zone')
    onDrop(e, assigneeId, dateStr)
  }

  const todayOffset = getDaysDiff(timelineStart, TODAY)

  return (
    <>
      {/* Header */}
      <div className="flex bg-white sticky top-0 z-30 shadow-sm">
        <div
          className="shrink-0 border-r border-b bg-gray-50 p-2 font-semibold text-gray-600 sticky left-0 top-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
          style={{ width: V_DATE_COL_WIDTH, height: 56 }}
        >
          日期 \ 同仁
        </div>
        {colleagues.map(colleague => (
          <div
            key={colleague.id}
            className="shrink-0 border-r border-b bg-white flex items-center justify-center sticky top-0 z-10 shadow-sm"
            style={{ width: getColWidth(colleague.id), height: 56 }}
          >
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-1.5 rounded-full text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">{colleague.name}</div>
                <div className="text-xs text-gray-500">{colleague.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="relative">
        {viewDays.map(day => {
          const dateStr = formatDate(day)
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isToday = dateStr === todayStr
          const isMonday = day.getDay() === 1

          return (
            <div
              key={dateStr}
              className={`flex ${isMonday ? 'border-t-2 border-t-gray-300' : 'border-t'} relative`}
              style={{ height: V_ROW_HEIGHT }}
            >
              <div
                className={`shrink-0 border-r flex items-center justify-center sticky left-0 z-20 text-sm font-mono ${isToday ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-white text-gray-600'} ${isWeekend ? 'bg-gray-50' : ''}`}
                style={{ width: V_DATE_COL_WIDTH }}
              >
                <span>
                  {isMonday || day.getDate() === 1 ? `${day.getMonth() + 1}/` : ''}
                  {String(day.getDate()).padStart(2, '0')} {DAY_NAMES[day.getDay()]}
                </span>
              </div>
              {colleagues.map(colleague => {
                const cellId = `cell-${colleague.id}-${dateStr}`
                return (
                  <div
                    key={colleague.id}
                    id={cellId}
                    className={`shrink-0 border-r transition-colors ${isWeekend ? 'bg-gray-100/30' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}
                    style={{ width: getColWidth(colleague.id) }}
                    onDragOver={e => handleCellDragOver(e, cellId)}
                    onDragLeave={e => handleCellDragLeave(e, cellId)}
                    onDrop={e => handleCellDrop(e, colleague.id, dateStr, cellId)}
                  />
                )
              })}
            </div>
          )
        })}

        {/* Today line */}
        {todayOffset >= 0 && todayOffset < totalDays && (
          <div
            className="absolute h-0.5 bg-red-400 z-[5] pointer-events-none"
            style={{ top: todayOffset * V_ROW_HEIGHT + V_ROW_HEIGHT / 2, left: V_DATE_COL_WIDTH, right: 0 }}
          />
        )}

        {/* Task bars */}
        {colleagues.map((colleague, colIndex) => {
          const { taskLayouts } = getColleagueLanes(colleague.id, tasks)
          let colLeft = V_DATE_COL_WIDTH
          for (let ci = 0; ci < colIndex; ci++) {
            colLeft += getColWidth(colleagues[ci]!.id)
          }

          const assignedTasks = tasks.filter(t => t.assigneeId === colleague.id && t.startDate)
          return assignedTasks.map(task => {
            const startObj = parseDate(task.startDate!)
            const endObj = parseDate(task.endDate!)
            if (endObj < timelineStart || startObj > timelineEnd) return null

            const offsetDays = getDaysDiff(timelineStart, startObj)
            const durationDays = getDaysDiff(startObj, endObj) + 1
            const topOffset = offsetDays * V_ROW_HEIGHT + 2
            const height = durationDays * V_ROW_HEIGHT - 4
            const lane = taskLayouts[task.id] || 0
            const leftOffset = colLeft + 8 + lane * (V_TASK_WIDTH + 8)
            const isResizing = resizingTaskId === task.id
            const transitionClass = isResizing ? '' : 'transition-all'

            return (
              <div key={task.id}>
                <div
                  draggable
                  onDragStart={e => onDragStart(e, task.id)}
                  onDragEnd={e => { (e.target as HTMLElement).style.opacity = '1' }}
                  className={`task-bar vertical absolute rounded border shadow-sm cursor-move overflow-hidden flex flex-col items-start justify-start p-1.5 ${transitionClass} hover:brightness-95 hover:shadow-md z-10 ${task.color}`}
                  style={{ left: leftOffset, width: V_TASK_WIDTH, top: topOffset, height }}
                  title={`${task.title} (${task.startDate} ~ ${task.endDate})`}
                >
                  <div
                    className="resize-handle absolute left-0 right-0 top-0 h-2.5 cursor-ns-resize rounded-t z-20"
                    onMouseDown={e => onInitResize(e, task.id, 'top')}
                  />
                  <div className="flex items-start justify-between w-full mt-1">
                    <span className="text-xs font-bold leading-tight line-clamp-2 flex-1">{task.title}</span>
                    <div className="flex shrink-0 opacity-0 hover:opacity-100 transition-opacity" style={{ marginTop: -2 }}>
                      <button
                        onClick={e => { e.stopPropagation(); onEditTask(task.id) }}
                        className="p-0.5 hover:bg-black/10 rounded"
                        title="編輯"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onDuplicateTask(task.id) }}
                        className="p-0.5 hover:bg-black/10 rounded"
                        title="複製"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] opacity-60 mt-auto">
                    {task.duration}天{task.deadline ? ` | 截止${task.deadline.slice(5)}` : ''}
                  </span>
                  <div
                    className="resize-handle absolute left-0 right-0 bottom-0 h-2.5 cursor-ns-resize rounded-b z-20"
                    onMouseDown={e => onInitResize(e, task.id, 'bottom')}
                  />
                </div>

                {/* Deadline marker */}
                {task.deadline && (() => {
                  const dlOffset = getDaysDiff(timelineStart, parseDate(task.deadline))
                  const dlY = (dlOffset + 1) * V_ROW_HEIGHT
                  return (
                    <div
                      className="absolute z-[6] pointer-events-none"
                      style={{
                        left: leftOffset,
                        top: dlY - 1,
                        width: V_TASK_WIDTH,
                        height: 2,
                        background: '#ef4444',
                        borderRadius: 1,
                      }}
                      title={`截止: ${task.deadline}`}
                    />
                  )
                })()}
              </div>
            )
          })
        })}
      </div>
    </>
  )
}
