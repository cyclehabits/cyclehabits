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

export function HabitItem({ habit, log, override, date, onUpdate }: HabitItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showScopeModal, setShowScopeModal] = useState(false)

  const status: HabitStatus = log?.status ?? 'pending'
  const displayName = override?.name ?? habit.name
  const displayDesc = override?.description ?? habit.description
  const displayTime = override?.time ?? habit.time

  function handleCheck() {
    onUpdate(habit.id, STATUS_CYCLE[status])
  }

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

  return (
    <>
      <li className={`habit-item habit-item--${status}`}>
        <button
          className="habit-item__check"
          onClick={handleCheck}
          aria-label={`${displayName}: ${status}`}
        >
          {STATUS_ICON[status]}
        </button>
        <div className="habit-item__body">
          <span className="habit-item__name">{displayName}</span>
          {displayDesc && (
            <span className="habit-item__desc">{displayDesc}</span>
          )}
          {displayTime && (
            <span className="habit-item__time">{displayTime}</span>
          )}
        </div>
        <button
          className="habit-item__edit"
          onClick={handleEditClick}
          aria-label={t('habits.edit')}
        >
          ✎
        </button>
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
