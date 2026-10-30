import { useState, useMemo } from 'react'
import { WeekStrip } from '@/components/week/WeekStrip'
import { HabitList } from '@/components/habit/HabitList'
import { DailyProgress } from '@/components/progress/DailyProgress'
import { PageHeader } from './components/PageHeader'
import { useHabits } from '@/hooks/useHabits'
import { useHabitsLog } from '@/hooks/useHabitsLog'
import { isHabitScheduledForDate, formatDate } from '@/utils/habit'
import './TodayPage.css'

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = formatDate(selectedDate)

  const { habits, loading } = useHabits()
  const { logs, updateLog } = useHabitsLog(dateStr)

  const todayHabits = useMemo(
    () => habits.filter((h) => isHabitScheduledForDate(h, selectedDate)),
    [habits, selectedDate],
  )

  const doneCount = todayHabits.filter((h) => logs[h.id]?.status === 'done').length

  if (loading) {
    return <div className="today-page today-page--loading">Carregando…</div>
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
            onUpdate={(habitId, status) => updateLog({ habitId, status })}
            emptyMessage="Nenhum hábito agendado para este dia."
          />
        </section>
      </div>
    </div>
  )
}