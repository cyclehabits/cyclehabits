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

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <polyline points="2,7 6,11 12,3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSkip = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <polyline points="8,4 11,7 8,10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const StatusDot = ({ status }: { status: HabitStatus }) => {
  if (status === 'done') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <polyline points="5.5,10 8.5,13 14.5,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (status === 'ignored') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
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
          <StatusDot status={status} />
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
            <IconCheck />
          </button>
          <button
            className={`habit-item__btn habit-item__btn--ignore${status === 'ignored' ? ' habit-item__btn--active' : ''}`}
            onClick={handleIgnore}
            aria-label={t('habits.ignore')}
            title={t('habits.ignore')}
          >
            <IconSkip />
          </button>
          <button
            className="habit-item__edit"
            onClick={handleEditClick}
            aria-label={t('habits.edit')}
            title={t('habits.edit')}
          >
            <IconEdit />
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
