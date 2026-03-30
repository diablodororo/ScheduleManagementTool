import { User, GripVertical, Pencil, Copy } from 'lucide-react'
import type { Colleague, Task } from '../types'
import {
  CELL_WIDTH, ROW_MIN_HEIGHT, TASK_HEIGHT, TASK_GAP,
  NAME_COL_WIDTH, DAY_NAMES, TODAY,
} from '../constants'
import { formatDate, parseDate, getDaysDiff, addDays } from '../utils/date'
import { getColleagueLanes } from '../utils/lanes'

interface HorizontalViewProps {
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

export default function HorizontalView({
  colleagues, tasks, timelineStart, timelineEnd, resizingTaskId,
  onDragStart, onDrop, onInitResize, onEditTask, onDuplicateTask,
}: HorizontalViewProps) {
  const totalDays = getDaysDiff(timelineStart, timelineEnd)
  const viewDays = Array.from({ length: totalDays }).map((_, i) => addDays(timelineStart, i))
  const todayStr = formatDate(TODAY)
  void NAME_COL_WIDTH

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

  return (
    <>
      {/* Header */}
      <div className="flex border-b bg-white sticky top-0 z-30 shadow-sm">
        <div className="w-56 shrink-0 border-r bg-gray-50 p-3 font-semibold text-gray-600 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
          同仁 \ 日期
        </div>
        {viewDays.map(day => {
          const dateStr = formatDate(day)
          const isToday = dateStr === todayStr
          const isMonday = day.getDay() === 1
          return (
            <div
              key={dateStr}
              className={`shrink-0 border-r flex flex-col items-center justify-center py-1.5 ${isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-600'} ${isMonday ? 'border-l-2 border-l-gray-300' : ''}`}
              style={{ width: CELL_WIDTH }}
            >
              <span className="text-xs opacity-70">
                {isMonday || day.getDate() === 1 ? `${day.getMonth() + 1}月` : ''}
              </span>
              <span className={`font-mono text-base ${isToday ? 'font-bold' : ''}`}>
                {String(day.getDate()).padStart(2, '0')} {DAY_NAMES[day.getDay()]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div>
        {colleagues.map(colleague => {
          const { taskLayouts, totalLanes } = getColleagueLanes(colleague.id, tasks)
          const dynamicRowHeight = Math.max(ROW_MIN_HEIGHT, totalLanes * (TASK_HEIGHT + TASK_GAP) + 20)
          const todayOffset = getDaysDiff(timelineStart, TODAY)
          const assignedTasks = tasks.filter(t => t.assigneeId === colleague.id && t.startDate)

          return (
            <div key={colleague.id} className="flex border-b relative group">
              <div className="w-56 shrink-0 border-r bg-white p-4 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{colleague.name}</div>
                    <div className="text-xs text-gray-500">{colleague.role}</div>
                  </div>
                </div>
              </div>
              <div className="flex relative" style={{ height: dynamicRowHeight }}>
                {viewDays.map(day => {
                  const dateStr = formatDate(day)
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const isToday = dateStr === todayStr
                  const isMonday = day.getDay() === 1
                  const cellId = `cell-${colleague.id}-${dateStr}`
                  return (
                    <div
                      key={dateStr}
                      id={cellId}
                      className={`shrink-0 border-r transition-colors ${isWeekend ? 'bg-gray-100/50' : ''} ${isToday ? 'bg-blue-50/40' : ''} ${isMonday ? 'border-l-2 border-l-gray-300' : ''}`}
                      style={{ width: CELL_WIDTH }}
                      onDragOver={e => handleCellDragOver(e, cellId)}
                      onDragLeave={e => handleCellDragLeave(e, cellId)}
                      onDrop={e => handleCellDrop(e, colleague.id, dateStr, cellId)}
                    />
                  )
                })}

                {/* Today line */}
                {todayOffset >= 0 && todayOffset < totalDays && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-[5] pointer-events-none"
                    style={{ left: todayOffset * CELL_WIDTH + CELL_WIDTH / 2 }}
                  />
                )}

                {/* Task bars */}
                {assignedTasks.map(task => {
                  const startObj = parseDate(task.startDate!)
                  const endObj = parseDate(task.endDate!)
                  if (endObj < timelineStart || startObj > timelineEnd) return null

                  const offsetDays = getDaysDiff(timelineStart, startObj)
                  const durationDays = getDaysDiff(startObj, endObj) + 1
                  const leftOffset = offsetDays * CELL_WIDTH
                  const width = durationDays * CELL_WIDTH
                  const topOffset = 10 + (taskLayouts[task.id] || 0) * (TASK_HEIGHT + TASK_GAP)
                  const isResizing = resizingTaskId === task.id
                  const transitionClass = isResizing ? '' : 'transition-all'

                  return (
                    <div key={task.id}>
                      <div
                        draggable
                        onDragStart={e => onDragStart(e, task.id)}
                        onDragEnd={e => { (e.target as HTMLElement).style.opacity = '1' }}
                        className={`task-bar horizontal group absolute rounded border shadow-sm cursor-move overflow-hidden whitespace-nowrap text-ellipsis flex items-center ${transitionClass} hover:brightness-95 hover:shadow-md z-10 ${task.color}`}
                        style={{
                          left: leftOffset,
                          width: width - 8,
                          top: topOffset,
                          height: TASK_HEIGHT,
                          marginLeft: 4,
                        }}
                        title={`${task.title} (${task.startDate} ~ ${task.endDate})`}
                      >
                        <div
                          className="resize-handle absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize rounded-l z-20"
                          onMouseDown={e => onInitResize(e, task.id, 'left')}
                        />
                        <GripVertical className="ml-3.5 mr-1 w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                        <span className="text-xs font-bold leading-none truncate flex-1">{task.title}</span>
                        <button
                          onClick={e => { e.stopPropagation(); onEditTask(task.id) }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 hover:bg-black/10 rounded transition-opacity"
                          title="編輯"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onDuplicateTask(task.id) }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 hover:bg-black/10 rounded mr-1 transition-opacity"
                          title="複製"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <div
                          className="resize-handle absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize rounded-r z-20"
                          onMouseDown={e => onInitResize(e, task.id, 'right')}
                        />
                      </div>

                      {/* Deadline marker */}
                      {task.deadline && (() => {
                        const dlOffset = getDaysDiff(timelineStart, parseDate(task.deadline))
                        const dlX = (dlOffset + 1) * CELL_WIDTH
                        return dlX > 0 ? (
                          <div
                            className="absolute z-[6] pointer-events-none"
                            style={{
                              left: dlX - 1,
                              top: topOffset - 2,
                              height: TASK_HEIGHT + 4,
                              width: 2,
                              background: '#ef4444',
                              borderRadius: 1,
                            }}
                            title={`截止: ${task.deadline}`}
                          />
                        ) : null
                      })()}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
