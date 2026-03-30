import { useState, useCallback, useRef, useEffect } from 'react'
import type { Task, ViewMode } from './types'
import {
  INITIAL_COLLEAGUES, INITIAL_TASKS, TODAY,
  CELL_WIDTH, V_ROW_HEIGHT, EXTEND_DAYS, EDGE_THRESHOLD,
  NAME_COL_WIDTH,
} from './constants'
import { formatDate, getDaysDiff, addDays, parseDate } from './utils/date'
import { useResize } from './hooks/useResize'
import Toolbar from './components/Toolbar'
import TaskPool from './components/TaskPool'
import HorizontalView from './components/HorizontalView'
import VerticalView from './components/VerticalView'
import AddTaskModal from './components/AddTaskModal'
import EditTaskModal from './components/EditTaskModal'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [viewMode, setViewMode] = useState<ViewMode>('vertical')
  const [timelineStart, setTimelineStart] = useState(() => addDays(TODAY, -14))
  const [timelineEnd, setTimelineEnd] = useState(() => addDays(TODAY, 60))
  const [dateRange, setDateRange] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const taskIdCounter = useRef(INITIAL_TASKS.length + 1)
  const isExtendingRef = useRef(false)

  const colleagues = INITIAL_COLLEAGUES

  const { initResize, resizingTaskIdRef } = useResize({
    tasks,
    viewMode,
    onTasksChange: setTasks,
  })

  // Drag & Drop
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.4' }, 0)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, assigneeId: string, dateStr: string) => {
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task
      const newStart = parseDate(dateStr)
      const duration = task.startDate
        ? getDaysDiff(parseDate(task.startDate), parseDate(task.endDate!)) + 1
        : task.duration
      let newEnd = addDays(newStart, duration - 1)

      if (task.deadline) {
        const dl = parseDate(task.deadline)
        if (newEnd > dl) newEnd = dl
        if (newStart > dl) return task
      }

      return {
        ...task,
        assigneeId,
        startDate: formatDate(newStart),
        endDate: formatDate(newEnd),
        duration: getDaysDiff(newStart, newEnd) + 1,
      }
    }))
  }, [])

  const handleDropToPool = useCallback((e: React.DragEvent) => {
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, assigneeId: null, startDate: null, endDate: null }
        : task
    ))
  }, [])

  // Task CRUD
  const handleAddTask = useCallback((taskData: Omit<Task, 'id'>) => {
    const id = 't' + (++taskIdCounter.current)
    setTasks(prev => [...prev, { ...taskData, id }])
  }, [])

  const handleSaveTask = useCallback((updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }, [])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const handleDuplicateTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const source = prev.find(t => t.id === taskId)
      if (!source) return prev
      const id = 't' + (++taskIdCounter.current)
      return [...prev, { ...source, id }]
    })
  }, [])

  // View toggle
  const handleToggleView = useCallback(() => {
    setViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')
    setTimeout(scrollToToday, 50)
  }, [])

  // Scroll to today
  const scrollToToday = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const todayOffset = getDaysDiff(timelineStart, TODAY)
    if (viewMode === 'horizontal') {
      el.scrollLeft = todayOffset * CELL_WIDTH - el.clientWidth / 3
    } else {
      el.scrollTop = todayOffset * V_ROW_HEIGHT - el.clientHeight / 3
    }
  }, [timelineStart, viewMode])

  // Update date range display
  const updateDateDisplay = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    let fromDate: Date, toDate: Date
    if (viewMode === 'horizontal') {
      const leftDay = Math.floor(el.scrollLeft / CELL_WIDTH)
      const visibleCols = Math.ceil(el.clientWidth / CELL_WIDTH)
      fromDate = addDays(timelineStart, Math.max(0, leftDay))
      toDate = addDays(timelineStart, leftDay + visibleCols)
    } else {
      const topDay = Math.floor(el.scrollTop / V_ROW_HEIGHT)
      const visibleRows = Math.ceil(el.clientHeight / V_ROW_HEIGHT)
      fromDate = addDays(timelineStart, Math.max(0, topDay))
      toDate = addDays(timelineStart, topDay + visibleRows)
    }
    setDateRange(`${formatDate(fromDate)} ~ ${formatDate(toDate)}`)
  }, [timelineStart, viewMode])

  // Infinite scroll extension
  const checkAndExtend = useCallback(() => {
    if (isExtendingRef.current) return
    const el = scrollRef.current
    if (!el) return

    if (viewMode === 'horizontal') {
      const totalWidth = getDaysDiff(timelineStart, timelineEnd) * CELL_WIDTH + NAME_COL_WIDTH
      const scrollRight = totalWidth - el.scrollLeft - el.clientWidth
      if (scrollRight < EDGE_THRESHOLD) {
        isExtendingRef.current = true
        setTimelineEnd(prev => addDays(prev, EXTEND_DAYS))
        isExtendingRef.current = false
      }
      if (el.scrollLeft < EDGE_THRESHOLD) {
        isExtendingRef.current = true
        setTimelineStart(prev => addDays(prev, -EXTEND_DAYS))
        el.scrollLeft += EXTEND_DAYS * CELL_WIDTH
        isExtendingRef.current = false
      }
    } else {
      const totalHeight = getDaysDiff(timelineStart, timelineEnd) * V_ROW_HEIGHT + 60
      const scrollBottom = totalHeight - el.scrollTop - el.clientHeight
      if (scrollBottom < EDGE_THRESHOLD) {
        isExtendingRef.current = true
        setTimelineEnd(prev => addDays(prev, EXTEND_DAYS))
        isExtendingRef.current = false
      }
      if (el.scrollTop < EDGE_THRESHOLD) {
        isExtendingRef.current = true
        setTimelineStart(prev => addDays(prev, -EXTEND_DAYS))
        el.scrollTop += EXTEND_DAYS * V_ROW_HEIGHT
        isExtendingRef.current = false
      }
    }
  }, [timelineStart, timelineEnd, viewMode])

  // Scroll event handler
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      updateDateDisplay()
      checkAndExtend()
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [updateDateDisplay, checkAndExtend])

  // Initial scroll
  useEffect(() => {
    updateDateDisplay()
    setTimeout(scrollToToday, 50)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sharedProps = {
    colleagues,
    tasks,
    timelineStart,
    timelineEnd,
    resizingTaskId: resizingTaskIdRef.current,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
    onInitResize: initResize,
    onEditTask: (taskId: string) => setEditingTask(tasks.find(t => t.id === taskId) || null),
    onDuplicateTask: handleDuplicateTask,
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Resize tooltip */}
      <div id="resize-tooltip" className="resize-tooltip" style={{ display: 'none' }} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Toolbar
          dateRange={dateRange}
          viewMode={viewMode}
          onScrollToToday={scrollToToday}
          onToggleView={handleToggleView}
        />

        <div ref={scrollRef} className="flex-1 overflow-auto relative bg-gray-50/30">
          <div className="min-w-max">
            {viewMode === 'horizontal'
              ? <HorizontalView {...sharedProps} />
              : <VerticalView {...sharedProps} />
            }
          </div>
        </div>
      </div>

      <TaskPool
        tasks={tasks}
        onAddClick={() => setAddModalOpen(true)}
        onDragStart={handleDragStart}
        onDropToPool={handleDropToPool}
      />

      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddTask}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
