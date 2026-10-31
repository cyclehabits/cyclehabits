import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth/useAuth'
import { useHabits } from '@/hooks/useHabits'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { HabitLog } from '@/types/habit'
import { CalendarMonth } from './components/CalendarMonth'
import { DayDetail } from './components/DayDetail'
import { StreakCard } from './components/StreakCard'
import './HistoryPage.css'

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

function calcStreak(dayStats: Record<string, { done: number; total: number }>): number {
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (true) {
    const str = toLocalDateStr(cursor)
    const s = dayStats[str]
    if (!s || s.done === 0) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export default function HistoryPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { habits } = useHabits()
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(() => toLocalDateStr(new Date()))

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

  const { data: monthLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ['history-logs', user?.uid, year, month],
    enabled: !!user,
    queryFn: async () => {
      const dates = dateRange(monthStart, monthEnd)
      const snaps = await Promise.all(
        dates.map(date => getDocs(collection(db, 'users', user!.uid, 'logs', date, 'entries')))
      )
      return snaps.flatMap(s => s.docs.map(d => d.data() as HabitLog))
    }
  })

  // Últimos 90 dias para calcular streak
  const streakStart = toLocalDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90))
  const { data: streakLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ['streak-logs', user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const dates = dateRange(streakStart, toLocalDateStr(today))
      const snaps = await Promise.all(
        dates.map(date => getDocs(collection(db, 'users', user!.uid, 'logs', date, 'entries')))
      )
      return snaps.flatMap(s => s.docs.map(d => d.data() as HabitLog))
    }
  })

  const dayStats = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {}
    for (const log of monthLogs) {
      if (!map[log.date]) map[log.date] = { done: 0, total: 0 }
      map[log.date].total++
      if (log.status === 'done') map[log.date].done++
    }
    return map
  }, [monthLogs])

  const streakDayStats = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {}
    for (const log of streakLogs) {
      if (!map[log.date]) map[log.date] = { done: 0, total: 0 }
      map[log.date].total++
      if (log.status === 'done') map[log.date].done++
    }
    return map
  }, [streakLogs])

  const streak = useMemo(() => calcStreak(streakDayStats), [streakDayStats])

  const selectedLogs = useMemo(() => {
    if (!selectedDate) return []
    return monthLogs.filter(l => l.date === selectedDate)
  }, [monthLogs, selectedDate])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <div className="history-page">
      <div className="history-page__inner">
        <header>
          <h1 className="history-title">{t('history.title')}</h1>
        </header>

        <StreakCard streak={streak} />

        <CalendarMonth
          year={year}
          month={month}
          dayStats={dayStats}
          selectedDate={selectedDate}
          onDayClick={(d) => setSelectedDate(prev => prev === d ? null : d)}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          isCurrentMonth={isCurrentMonth}
        />

        {selectedDate && (
          <DayDetail
            dateStr={selectedDate}
            logs={selectedLogs}
            habits={habits}
          />
        )}
      </div>
    </div>
  )
}
