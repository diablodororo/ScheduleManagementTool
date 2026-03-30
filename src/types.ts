export interface Colleague {
  id: string
  name: string
  role: string
}

export interface Task {
  id: string
  title: string
  color: string
  assigneeId: string | null
  startDate: string | null
  endDate: string | null
  duration: number
  deadline: string | null
}

export interface TaskColor {
  bg: string
  dot: string
}

export type ViewMode = 'horizontal' | 'vertical'
