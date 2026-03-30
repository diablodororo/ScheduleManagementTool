import { Briefcase, Plus, GripVertical, Clock, AlertCircle } from 'lucide-react'
import type { Task } from '../types'

interface TaskPoolProps {
  tasks: Task[]
  onAddClick: () => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDropToPool: (e: React.DragEvent) => void
}

export default function TaskPool({ tasks, onAddClick, onDragStart, onDropToPool }: TaskPoolProps) {
  const unassigned = tasks.filter(t => !t.assigneeId || !t.startDate)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.classList.add('drag-over-pool')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over-pool')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over-pool')
    onDropToPool(e)
  }

  return (
    <div className="bg-gray-50 border-t z-20 shadow-[0_-2px_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
      <div className="px-5 py-2 border-b bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2 font-bold text-gray-700">
          <Briefcase className="text-blue-600 w-5 h-5" />
          <span>待分配任務庫</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full font-mono font-bold">
            {unassigned.length}
          </span>
          <button
            onClick={onAddClick}
            className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="flex items-start gap-3 p-3 overflow-x-auto transition-all"
        style={{ minHeight: 80 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {unassigned.length === 0 ? (
          <div className="w-full flex items-center justify-center text-gray-400 text-sm py-2">已全數排定</div>
        ) : (
          unassigned.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={e => onDragStart(e, task.id)}
              onDragEnd={e => { (e.target as HTMLElement).style.opacity = '1' }}
              className={`shrink-0 p-3 border rounded shadow-sm cursor-move hover:shadow-md transition-shadow ${task.color}`}
              style={{ minWidth: 200, maxWidth: 260 }}
            >
              <div className="flex items-center">
                <GripVertical className="mr-2 w-4 h-4 opacity-50 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-tight truncate">{task.title}</div>
                  <div className="mt-1 text-xs opacity-75 flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>工期: {task.duration} 天</span>
                    </span>
                    {task.deadline && (
                      <span className="flex items-center space-x-1 text-red-700">
                        <AlertCircle className="w-3 h-3" />
                        <span>截止: {task.deadline.slice(5)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
