import type { Habit, HabitLog, HabitStatus } from '@/types/habit'
import { HabitItem } from '@/components/habit/HabitItem'

interface HabitListProps {
  habits: Habit[]
  logs: Record<string, HabitLog>
  onUpdate: (habitId: string, status: HabitStatus) => void
  emptyMessage?: string
}

export function HabitList({ habits, logs, onUpdate, emptyMessage = 'Nenhum hábito para hoje.' }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-awake-text-muted)', fontSize: '0.875rem', padding: '2rem 0' }}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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