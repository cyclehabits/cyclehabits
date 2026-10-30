import { useTranslation } from 'react-i18next'
import type { Habit, HabitLog, HabitStatus } from '@/types/habit'
import './DayDetail.css'

interface DayDetailProps {
  dateStr: string
  logs: HabitLog[]
  habits: Habit[]
}

export function DayDetail({ dateStr, logs, habits }: DayDetailProps) {
  const { t } = useTranslation()

  const months = t('months.short', { returnObjects: true }) as string[]
  const weekdays = t('weekdays.long', { returnObjects: true }) as string[]

  const STATUS_LABEL: Record<HabitStatus, string> = {
    done: t('history.done'),
    ignored: t('history.ignored'),
    pending: t('history.pending'),
  }

  function formatDateLabel(str: string) {
    const [y, m, d] = str.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return `${weekdays[date.getDay()]}, ${d} ${months[m - 1]}`
  }

  const logMap = Object.fromEntries(logs.map(l => [l.habitId, l]))
  const rows = habits.map(habit => ({
    habit,
    status: (logMap[habit.id]?.status ?? 'pending') as HabitStatus,
  }))
  const doneCount = rows.filter(r => r.status === 'done').length

  return (
    <div className="day-detail">
      <div className="day-detail__header">
        <span className="day-detail__date">{formatDateLabel(dateStr)}</span>
        <span className="day-detail__summary">{doneCount}/{rows.length} {t('history.done').toLowerCase()}</span>
      </div>

      {rows.length === 0 ? (
        <p className="day-detail__empty">{t('history.noHabits')}</p>
      ) : (
        <ul className="day-detail__list">
          {rows.map(({ habit, status }) => (
            <li key={habit.id} className={`day-detail__item day-detail__item--${status}`}>
              <span className="day-detail__status-dot" />
              <span className="day-detail__name">{habit.name}</span>
              <span className="day-detail__status-label">{STATUS_LABEL[status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
