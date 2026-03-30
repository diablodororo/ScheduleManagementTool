import { TASK_COLORS } from '../constants'

interface ColorPickerProps {
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function ColorPicker({ selectedIndex, onSelect }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TASK_COLORS.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            i === selectedIndex
              ? 'border-gray-800 scale-110 ring-2 ring-offset-1 ring-gray-400'
              : 'border-transparent hover:scale-105'
          }`}
          style={{ background: c.dot }}
        />
      ))}
    </div>
  )
}
