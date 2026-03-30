import { useCallback, useRef } from 'react'
import type { Task, ViewMode } from '../types'
import { CELL_WIDTH, V_ROW_HEIGHT } from '../constants'
import { formatDate, parseDate, getDaysDiff, addDays } from '../utils/date'

interface UseResizeOptions {
  tasks: Task[]
  viewMode: ViewMode
  onTasksChange: (tasks: Task[]) => void
}

export function useResize({ tasks, viewMode, onTasksChange }: UseResizeOptions) {
  const resizingRef = useRef<{
    taskId: string
    direction: string
    startPos: number
    startStart: Date
    startEnd: Date
  } | null>(null)
  const resizingTaskIdRef = useRef<string | null>(null)

  const initResize = useCallback(
    (e: React.MouseEvent, taskId: string, direction: string) => {
      e.stopPropagation()
      e.preventDefault()
      const task = tasks.find(t => t.id === taskId)
      if (!task?.startDate || !task.endDate) return

      resizingRef.current = {
        taskId,
        direction,
        startPos: viewMode === 'horizontal' ? e.pageX : e.pageY,
        startStart: parseDate(task.startDate),
        startEnd: parseDate(task.endDate),
      }
      resizingTaskIdRef.current = taskId

      const cursorClass = viewMode === 'horizontal' ? 'cursor-ew-resize' : 'cursor-ns-resize'
      document.body.classList.add(cursorClass, 'select-none')

      const tooltip = document.getElementById('resize-tooltip')

      const handleMove = (ev: MouseEvent) => {
        const ref = resizingRef.current
        if (!ref) return
        const cellSize = viewMode === 'horizontal' ? CELL_WIDTH : V_ROW_HEIGHT
        const pos = viewMode === 'horizontal' ? ev.pageX : ev.pageY
        const delta = pos - ref.startPos
        const deltaDays = Math.round(delta / cellSize)
        const t = tasks.find(tt => tt.id === ref.taskId)
        if (!t) return

        if (ref.direction === 'right' || ref.direction === 'bottom') {
          let newEnd = addDays(ref.startEnd, deltaDays)
          if (newEnd < parseDate(t.startDate!)) newEnd = parseDate(t.startDate!)
          if (t.deadline && newEnd > parseDate(t.deadline)) newEnd = parseDate(t.deadline)
          t.endDate = formatDate(newEnd)
        } else {
          let newStart = addDays(ref.startStart, deltaDays)
          if (newStart > parseDate(t.endDate!)) newStart = parseDate(t.endDate!)
          t.startDate = formatDate(newStart)
        }
        t.duration = getDaysDiff(parseDate(t.startDate!), parseDate(t.endDate!)) + 1

        if (tooltip) {
          tooltip.style.display = 'block'
          tooltip.style.left = ev.pageX + 'px'
          tooltip.style.top = ev.pageY + 'px'
          tooltip.textContent = `${t.startDate} ~ ${t.endDate}（${t.duration} 天）`
        }

        onTasksChange([...tasks])
      }

      const handleUp = () => {
        resizingRef.current = null
        resizingTaskIdRef.current = null
        document.body.classList.remove('cursor-ew-resize', 'cursor-ns-resize', 'select-none')
        if (tooltip) tooltip.style.display = 'none'
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }

      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    },
    [tasks, viewMode, onTasksChange]
  )

  return { initResize, resizingTaskIdRef }
}
