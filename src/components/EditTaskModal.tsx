import { useState, useRef, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { TASK_COLORS } from '../constants'
import type { Task } from '../types'
import { formatDate, parseDate, getDaysDiff, addDays } from '../utils/date'
import ColorPicker from './ColorPicker'

interface EditTaskModalProps {
  task: Task | null
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
}

export default function EditTaskModal({ task, onClose, onSave, onDelete }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(1)
  const [deadline, setDeadline] = useState('')
  const [colorIndex, setColorIndex] = useState(0)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDuration(task.duration)
      setDeadline(task.deadline || '')
      const idx = TASK_COLORS.findIndex(c => c.bg === task.color)
      setColorIndex(idx >= 0 ? idx : 0)
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }
    const newDuration = Math.max(1, duration)
    const deadlineVal = deadline || null
    const updated = { ...task, title: title.trim(), color: TASK_COLORS[colorIndex]!.bg, deadline: deadlineVal }

    if (updated.startDate) {
      const newEnd = addDays(parseDate(updated.startDate), newDuration - 1)
      if (updated.deadline && newEnd > parseDate(updated.deadline)) {
        updated.endDate = updated.deadline
      } else {
        updated.endDate = formatDate(newEnd)
      }
      updated.duration = getDaysDiff(parseDate(updated.startDate), parseDate(updated.endDate)) + 1
    } else {
      updated.duration = newDuration
    }

    onSave(updated)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[420px] max-w-[90vw]">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">編輯工作</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">工作名稱</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">工期（天）</label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">截止日期（選填）</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">顏色標籤</label>
            <ColorPicker selectedIndex={colorIndex} onSelect={setColorIndex} />
          </div>
        </div>
        <div className="px-5 py-4 border-t flex justify-between">
          <button
            onClick={() => { onDelete(task.id); onClose() }}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>刪除</span>
          </button>
          <div className="flex space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">儲存</button>
          </div>
        </div>
      </div>
    </div>
  )
}
