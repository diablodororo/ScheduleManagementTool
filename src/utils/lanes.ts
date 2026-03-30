import type { Task } from '../types'
import { parseDate } from './date'

export interface LaneResult {
  taskLayouts: Record<string, number>
  totalLanes: number
}

export const getColleagueLanes = (colleagueId: string, tasks: Task[]): LaneResult => {
  const colleagueTasks = tasks.filter(t => t.assigneeId === colleagueId && t.startDate)
  const sorted = [...colleagueTasks].sort(
    (a, b) => parseDate(a.startDate!).getTime() - parseDate(b.startDate!).getTime()
  )
  const lanes: number[] = []
  const taskLayouts: Record<string, number> = {}

  sorted.forEach(task => {
    const start = parseDate(task.startDate!).getTime()
    const end = parseDate(task.endDate!).getTime()
    let placed = false
    for (let i = 0; i < lanes.length; i++) {
      if (start > lanes[i]!) {
        lanes[i] = end
        taskLayouts[task.id] = i
        placed = true
        break
      }
    }
    if (!placed) {
      lanes.push(end)
      taskLayouts[task.id] = lanes.length - 1
    }
  })

  return { taskLayouts, totalLanes: Math.max(1, lanes.length) }
}
