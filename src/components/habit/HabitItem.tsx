import type { Habit, HabitLog, HabitStatus } from '@/types/habit'
import '@/components/habit/HabitItem.css'

interface HabitItemProps {
  habit: Habit
  log?: HabitLog
  onUpdate: (habitId: string, status: HabitStatus) => void
}

const STATUS_CYCLE: Record<HabitStatus, HabitStatus> = {
  pending: 'done',
  done: 'ignored',
  ignored: 'pending',
}

const STATUS_ICON: Record<HabitStatus, string> = {
  pending: '○',
  done: '✓',
  ignored: '–',
}

export function HabitItem({ habit, log, onUpdate }: HabitItemProps) {
  const status: HabitStatus = log?.status ?? 'pending'

  function handleClick() {
    onUpdate(habit.id, STATUS_CYCLE[status])
  }

  return (
    <li className={`habit-item habit-item--${status}`}>
      <button
        className="habit-item__check"
        onClick={handleClick}
        aria-label={`${habit.name}: ${status}`}
      >
        {STATUS_ICON[status]}
      </button>
      <div className="habit-item__body">
        <span className="habit-item__name">{habit.name}</span>
        {habit.description && (
          <span className="habit-item__desc">{habit.description}</span>
        )}
      </div>
    </li>
  )
}