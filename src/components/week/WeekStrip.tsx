import { useMemo } from 'react'
import './WeekStrip.css'

interface WeekStripProps {
  selected: Date
  onChange: (date: Date) => void
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function WeekStrip({ selected, onChange }: WeekStripProps) {
  const days = useMemo(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}, [])

  function toLocalDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const todayStr = toLocalDateStr(new Date())
  const selectedStr = toLocalDateStr(selected)

  return (
    <div className="week-strip">
      {days.map((day) => {
        const str = day.toISOString().split('T')[0]
        const isToday = str === todayStr
        const isSelected = str === selectedStr
        return (
          <button
            key={str}
            className={`week-strip__day${isToday ? ' week-strip__day--today' : ''}${isSelected ? ' week-strip__day--selected' : ''}`}
            onClick={() => onChange(day)}
          >
            <span className="week-strip__label">{DAYS_SHORT[day.getDay()]}</span>
            <span className="week-strip__num">{day.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}