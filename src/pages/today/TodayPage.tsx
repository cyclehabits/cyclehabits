import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { WeekStrip } from '@/components/week/WeekStrip'
import { HabitList } from '@/components/habit/HabitList'
import { DailyProgress } from '@/components/progress/DailyProgress'
import { PageHeader } from './components/PageHeader'
import { useHabits } from '@/hooks/useHabits'
import { useHabitsLog } from '@/hooks/useHabitsLog'
import { useHabitOverrides } from '@/hooks/useHabitOverrides'
import { isHabitScheduledForDate, formatDate } from '@/utils/habit'
import type { HabitOverride } from '@/types/habit'
import './TodayPage.css'
import { useLocation } from 'react-router-dom'

export default function TodayPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const s = location.state as { date?: string } | null
    return s?.date ? new Date(s.date + 'T12:00:00') : new Date()
  })
  const dateStr = formatDate(selectedDate)

  const { habits, loading } = useHabits()
  const { logs, updateLog } = useHabitsLog(dateStr)
  const { data: overridesList = [] } = useHabitOverrides(dateStr)

  const todayHabits = useMemo(
    () => habits.filter((h) => isHabitScheduledForDate(h, selectedDate)),
    [habits, selectedDate],
  )

  const overridesMap = useMemo(
    () => Object.fromEntries(overridesList.map((o: HabitOverride) => [o.habitId, o])),
    [overridesList],
  )

  const doneCount = todayHabits.filter((h) => logs[h.id]?.status === 'done').length

  if (loading) {
    return <div className="today-page today-page--loading">{t('today.loading')}</div>
  }

  return (
    <div className="today-page">
      <div className="today-page__inner">
        <PageHeader date={selectedDate} />

        <WeekStrip selected={selectedDate} onChange={setSelectedDate} />

        <DailyProgress done={doneCount} total={todayHabits.length} />

        <section className="today-page__section">
          <HabitList
            habits={todayHabits}
            logs={logs}
            overrides={overridesMap}
            date={dateStr}
            onUpdate={(habitId, status) => updateLog({ habitId, status })}
            emptyMessage={t('today.noHabits')}
          />
        </section>
      </div>
    </div>
  )
}
