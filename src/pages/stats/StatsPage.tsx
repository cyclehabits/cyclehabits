import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth/useAuth'
import { useHabits } from '@/hooks/useHabits'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { Loading } from '@awakr/awake-ui/loading'
import type { HabitLog } from '@/types/habit'
import './StatsPage.css'

function toLocalDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const cursor = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  while (cursor <= endDate) {
    dates.push(toLocalDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export default function StatsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { habits } = useHabits()

  const today = new Date()
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const monthEnd = toLocalDateStr(today)

  const months = t('months.long', { returnObjects: true }) as string[]
  const currentMonthLabel = `${months[today.getMonth()]} ${today.getFullYear()}`

  const { data: logs = [], isLoading } = useQuery<HabitLog[]>({
    queryKey: ['stats-logs', user?.uid, today.getFullYear(), today.getMonth()],
    enabled: !!user,
    queryFn: async () => {
      const dates = dateRange(monthStart, monthEnd)
      const snaps = await Promise.all(
        dates.map(date => getDocs(collection(db, 'users', user!.uid, 'logs', date, 'entries')))
      )
      return snaps.flatMap(s => s.docs.map(d => d.data() as HabitLog))
    },
  })

  const daysInMonth = today.getDate()

  const stats = useMemo(() => {
    return habits.map(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id)
      const done = habitLogs.filter(l => l.status === 'done').length
      const pct = daysInMonth === 0 ? 0 : Math.round((done / daysInMonth) * 100)
      return { habit, done, pct }
    })
  }, [habits, logs, daysInMonth])

  const totalDone = logs.filter(l => l.status === 'done').length
  const totalPossible = habits.length * daysInMonth
  const overallPct = totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100)

  return (
    <div className="stats-page">
      <div className="stats-page__inner">
        <h1 className="stats-title">Stats</h1>
        <p className="stats-subtitle">{currentMonthLabel}</p>

        {isLoading ? (
          <div className="stats-loading"><Loading size="md" /></div>
        ) : (
          <>
            <div className="stats-overall">
              <span className="stats-overall__pct">{overallPct}%</span>
              <span className="stats-overall__label">{t('dashboard.progress')}</span>
            </div>

            <ul className="stats-list">
              {stats.map(({ habit, done, pct }) => (
                <li key={habit.id} className="stats-item">
                  <div className="stats-item__header">
                    <span className="stats-item__name">{habit.name}</span>
                    <span className="stats-item__count">{done}/{daysInMonth}d · {pct}%</span>
                  </div>
                  <div className="stats-item__bar-track">
                    <div
                      className="stats-item__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
