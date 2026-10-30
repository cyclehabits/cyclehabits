import { Loading } from '@awakr/awake-ui/loading'
import type { Habit, HabitLog, HabitStatus } from '@/types/habit'
import { HabitItem } from '@/components/habit/HabitItem'
import '@/components/habit/HabitList.css'

interface HabitListProps {
  habits: Habit[]
  logs: Record<string, HabitLog>
  onUpdate: (habitId: string, status: HabitStatus) => void
  emptyMessage?: string
  loading?: boolean
}

export function HabitList({ habits, logs, onUpdate, emptyMessage = '', loading }: HabitListProps) {
  if (loading) {
    return (
      <div className="habit-list__loading">
        <Loading size="md" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <p className="habit-list__empty">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="habit-list">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          log={logs[habit.id]}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  )
}
