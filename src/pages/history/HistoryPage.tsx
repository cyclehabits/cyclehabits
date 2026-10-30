import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth/useAuth'
import { useQuery } from '@tanstack/react-query'
import { collectionGroup, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { HabitLog } from '@/types/habit'
import './HistoryPage.css'
import { useNavigate } from 'react-router-dom'

function toLocalDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAY_LABELS = ['D','S','T','Q','Q','S','S']

export default function HistoryPage() {
  const { user } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const navigate = useNavigate()

  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)

  const { data: logs = [] } = useQuery<HabitLog[]>({
    queryKey: ['history-logs', user?.uid, year, month],
    enabled: !!user,
    queryFn: async () => {
      const q = query(
        collectionGroup(db, 'entries'),
        where('date', '>=', toLocalDateStr(start)),
        where('date', '<=', toLocalDateStr(end))
      )
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as HabitLog))
    }
  })

  const dayStats = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {}
    for (const log of logs) {
      if (!map[log.date]) map[log.date] = { done: 0, total: 0 }
      map[log.date].total++
      if (log.status === 'done') map[log.date].done++
    }
    return map
  }, [logs])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
    if (isCurrentMonth) return
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDayOfWeek = start.getDay()
  const daysInMonth = end.getDate()
  const todayStr = toLocalDateStr(today)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  function getDotClass(dateStr: string) {
    const s = dayStats[dateStr]
    if (!s || s.total === 0) return ''
    const pct = s.done / s.total
    if (pct === 1) return 'day--full'
    if (pct >= 0.5) return 'day--partial'
    return 'day--low'
  }

  return (
    <div className="history-page">
      <div className="history-page__inner">
        <header className="history-header">
          <h1 className="history-title">Histórico</h1>
        </header>

        <div className="calendar-card">
          <div className="calendar-nav">
            <button className="calendar-nav__btn" onClick={prevMonth}>‹</button>
            <span className="calendar-nav__label">{MONTH_NAMES[month]} {year}</span>
            <button className="calendar-nav__btn" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
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
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const isFuture = dateStr > todayStr
              const dotClass = getDotClass(dateStr)
              return (
                // <div key={dayNum} className={`calendar-day ${isToday ? 'calendar-day--today' : ''} ${isFuture ? 'calendar-day--future' : ''}`}>
                //   <span className="calendar-day__num">{dayNum}</span>
                //   {!isFuture && dotClass && <span className={`calendar-day__dot ${dotClass}`} />}
                // </div>
                <button
                  key={dayNum}
                  disabled={isFuture}
                  onClick={() => !isFuture && navigate('/today', { state: { date: dateStr } })}
                  className={`calendar-day ${isToday ? 'calendar-day--today' : ''} ${isFuture ? 'calendar-day--future' : ''}`}
                >
                  <span className="calendar-day__num">{dayNum}</span>
                  {!isFuture && dotClass && <span className={`calendar-day__dot ${dotClass}`} />}
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
      </div>
    </div>
  )
}