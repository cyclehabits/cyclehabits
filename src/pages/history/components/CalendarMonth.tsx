import './CalendarMonth.css'

interface DayStat {
  done: number
  total: number
}

interface CalendarMonthProps {
  year: number
  month: number
  dayStats: Record<string, DayStat>
  selectedDate: string | null
  onDayClick: (dateStr: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  isCurrentMonth: boolean
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAY_LABELS = ['D','S','T','Q','Q','S','S']

function toLocalDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDotClass(stat: DayStat | undefined) {
  if (!stat || stat.total === 0) return ''
  const pct = stat.done / stat.total
  if (pct === 1) return 'day--full'
  if (pct >= 0.5) return 'day--partial'
  return 'day--low'
}

export function CalendarMonth({
  year, month, dayStats, selectedDate,
  onDayClick, onPrevMonth, onNextMonth, isCurrentMonth
}: CalendarMonthProps) {
  const today = new Date()
  const todayStr = toLocalDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div className="calendar-card">
      <div className="calendar-nav">
        <button className="calendar-nav__btn" onClick={onPrevMonth}>‹</button>
        <span className="calendar-nav__label">{MONTH_NAMES[month]} {year}</span>
        <button className="calendar-nav__btn" onClick={onNextMonth} disabled={isCurrentMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="calendar-grid__label">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1
          const dateStr = toLocalDateStr(year, month, dayNum)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const isSelected = dateStr === selectedDate
          const dotClass = getDotClass(dayStats[dateStr])

          return (
            <button
              key={dayNum}
              disabled={isFuture}
              onClick={() => onDayClick(dateStr)}
              className={[
                'calendar-day',
                isToday ? 'calendar-day--today' : '',
                isFuture ? 'calendar-day--future' : '',
                isSelected ? 'calendar-day--selected' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="calendar-day__num">{dayNum}</span>
              {!isFuture && dotClass && (
                <span className={`calendar-day__dot ${dotClass}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><span className="legend-dot day--full" />Tudo feito</span>
        <span className="legend-item"><span className="legend-dot day--partial" />Parcial</span>
        <span className="legend-item"><span className="legend-dot day--low" />Poucos</span>
      </div>
    </div>
  )
}
