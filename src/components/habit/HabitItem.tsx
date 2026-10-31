import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Habit, HabitLog, HabitStatus, HabitOverride } from '@/types/habit'
import { isRecurring } from '@/utils/habit'
import { EditScopeModal } from './EditScopeModal'
import '@/components/habit/HabitItem.css'

interface HabitItemProps {
  habit: Habit
  log?: HabitLog
  override?: HabitOverride
  date: string
  onUpdate: (habitId: string, status: HabitStatus) => void
}

const STATUS_ICON: Record<HabitStatus, string> = {
  pending: '○',
  done: '✓',
  ignored: '–',
}

export function HabitItem({ habit, log, override, date, onUpdate }: HabitItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showScopeModal, setShowScopeModal] = useState(false)

  const status: HabitStatus = log?.status ?? 'pending'
  const displayName = override?.name ?? habit.name
  const displayDesc = override?.description ?? habit.description
  const displayStartTime = override?.startTime ?? habit.startTime
  const displayEndTime = override?.endTime ?? habit.endTime

  const timeLabel = displayStartTime
    ? displayEndTime
      ? `${displayStartTime} – ${displayEndTime}`
      : displayStartTime
    : null

  function handleEditClick() {
    if (!isRecurring(habit)) {
      navigate(`/habits?edit=${habit.id}`)
    } else {
      setShowScopeModal(true)
    }
  }

  function handleEditThisDay() {
    setShowScopeModal(false)
    navigate(`/habits?edit=${habit.id}&date=${date}`)
  }

  function handleEditAllEvents() {
    setShowScopeModal(false)
    navigate(`/habits?edit=${habit.id}`)
  }

  function handleDone() {
    onUpdate(habit.id, status === 'done' ? 'pending' : 'done')
  }

  function handleIgnore() {
    onUpdate(habit.id, status === 'ignored' ? 'pending' : 'ignored')
  }

  return (
    <>
      <li className={`habit-item habit-item--${status}`}>
        <div className="habit-item__status">
          {STATUS_ICON[status]}
        </div>

        <div className="habit-item__body">
          <span className="habit-item__name">{displayName}</span>
          {displayDesc && (
            <span className="habit-item__desc">{displayDesc}</span>
          )}
          {timeLabel && (
            <span className="habit-item__time">{timeLabel}</span>
          )}
        </div>

        <div className="habit-item__actions">
          <button
            className={`habit-item__btn habit-item__btn--done${status === 'done' ? ' habit-item__btn--active' : ''}`}
            onClick={handleDone}
            aria-label={t('habits.done')}
            title={t('habits.done')}
          >
            ✓
          </button>
          <button
            className={`habit-item__btn habit-item__btn--ignore${status === 'ignored' ? ' habit-item__btn--active' : ''}`}
            onClick={handleIgnore}
            aria-label={t('habits.ignore')}
            title={t('habits.ignore')}
          >
            –
          </button>
          <button
            className="habit-item__edit"
            onClick={handleEditClick}
            aria-label={t('habits.edit')}
            title={t('habits.edit')}
          >
            ✎
          </button>
        </div>
      </li>

      {showScopeModal && (
        <EditScopeModal
          onThisDay={handleEditThisDay}
          onAllEvents={handleEditAllEvents}
          onClose={() => setShowScopeModal(false)}
        />
      )}
    </>
  )
}
