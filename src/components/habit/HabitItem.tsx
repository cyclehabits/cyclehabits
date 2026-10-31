import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Habit, HabitLog, HabitStatus, HabitOverride, HabitCategory } from '@/types/habit'
import { isRecurring } from '@/utils/habit'
import { EditScopeModal } from './EditScopeModal'
import { DeleteScopeModal } from './DeleteScopeModal'
import { useDeleteHabit } from '@/hooks/useDeleteHabit'
import { useDeleteHabitDay } from '@/hooks/useDeleteHabitDay'
import '@/components/habit/HabitItem.css'

interface HabitItemProps {
  habit: Habit
  log?: HabitLog
  override?: HabitOverride
  date: string
  onUpdate: (habitId: string, status: HabitStatus) => void
}

// ── Ícones por categoria ──────────────────────────────────────────────────────

const IconSaude = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.81 3.85 12 5C12.19 3.85 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11h6M12 8v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconEnergia = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconMindful = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 12v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconConhecimento = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconOutra = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <polyline points="2.5,8 6.5,12 13.5,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSkip = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <polyline points="9,4.5 13,8 9,11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Helpers de categoria ──────────────────────────────────────────────────────

function useCategoryMeta(t: (key: string) => string): Record<HabitCategory, { icon: React.ReactNode; label: string; emoji: string }> {
  return {
    saude:        { icon: <IconSaude />,        label: t('habits.categories.saude'),        emoji: '💊' },
    energia:      { icon: <IconEnergia />,      label: t('habits.categories.energia'),      emoji: '⚡' },
    mindful:      { icon: <IconMindful />,      label: t('habits.categories.mindful'),      emoji: '🧘' },
    conhecimento: { icon: <IconConhecimento />, label: t('habits.categories.conhecimento'), emoji: '📚' },
    outra:        { icon: <IconOutra />,        label: t('habits.categories.outra'),        emoji: '⭐' },
  }
}

function derivePeriod(startTime?: string): string {
  if (!startTime) return ''
  const [h] = startTime.split(':').map(Number)
  if (h < 12) return 'Manhã'
  if (h < 18) return 'Tarde'
  return 'Noite'
}

// ── Swipe hook ────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 60
const MOVE_THRESHOLD = 8 // mínimo pra considerar que foi um arrasto

function useSwipe(onSwipeLeft: () => void, onClose: () => void) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const moved = useRef(false)

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    startY.current = e.clientY
    moved.current = false
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return
    const dx = Math.abs(e.clientX - startX.current)
    const dy = Math.abs(e.clientY - (startY.current ?? e.clientY))
    if (dx > MOVE_THRESHOLD && dx > dy) {
      moved.current = true
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null || !moved.current) {
      startX.current = null
      return
    }
    const delta = startX.current - e.clientX
    if (delta > SWIPE_THRESHOLD) onSwipeLeft()
    else if (delta < -SWIPE_THRESHOLD) onClose()
    startX.current = null
    moved.current = false
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function HabitItem({ habit, log, override, date, onUpdate }: HabitItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [swiped, setSwiped] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const deleteHabit    = useDeleteHabit()
  const deleteHabitDay = useDeleteHabitDay()

  const status           = log?.status ?? 'pending' as HabitStatus
  const displayName      = override?.name     ?? habit.name
  const displayStartTime = override?.startTime ?? habit.startTime
  const category         = habit.category ?? 'outra'
  const CATEGORY_META    = useCategoryMeta(t)
  const meta             = CATEGORY_META[category]
  const period           = derivePeriod(displayStartTime)
  const timeMeta         = displayStartTime
    ? period ? `${displayStartTime} · ${period}` : displayStartTime
    : null

  const completedAt = log?.completedAt
    ? new Date(log.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  function handleEditClick() {
    setSwiped(false)
    if (!isRecurring(habit)) navigate(`/habits?edit=${habit.id}`)
    else setShowEditModal(true)
  }

  function handleDeleteClick() {
    setSwiped(false)
    if (!isRecurring(habit)) deleteHabit.mutate(habit.id)
    else setShowDeleteModal(true)
  }

  const swipe = useSwipe(() => setSwiped(true), () => setSwiped(false))

  return (
    <>
      <li className={`habit-card-wrap${swiped ? ' habit-card-wrap--swiped' : ''}`}>
        {/* Ações reveladas pelo swipe */}
        <div className="habit-card__swipe-actions" aria-hidden={!swiped}>
          <button
            className="habit-card__swipe-btn habit-card__swipe-btn--edit"
            onClick={handleEditClick}
            tabIndex={swiped ? 0 : -1}
          >
            ✏️ {t('habits.edit')}
          </button>
          <button
            className="habit-card__swipe-btn habit-card__swipe-btn--delete"
            onClick={handleDeleteClick}
            tabIndex={swiped ? 0 : -1}
          >
            🗑️ {t('habits.delete')}
          </button>
        </div>

        {/* Card principal */}
        <div
          className={`habit-card habit-card--${status} habit-card--${category}`}
          {...swipe}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Ícone de categoria */}
          <div className="habit-card__icon" aria-hidden>
            {meta.icon}
          </div>

          {/* Corpo */}
          <div className="habit-card__body">
            <span className="habit-card__name">{displayName}</span>
            {timeMeta && (
              <span className="habit-card__time">{timeMeta}</span>
            )}
            <span className="habit-card__badge">
              {meta.emoji} {meta.label}
            </span>
          </div>

          {/* Botões de ação sempre visíveis */}
          <div className="habit-card__right">
            {/* Ignore — só quando pendente */}
            {status === 'pending' && (
              <button
                className="habit-card__action-btn habit-card__action-btn--ignore"
                onPointerDown={e => e.stopPropagation()}
                onPointerMove={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={() => onUpdate(habit.id, 'ignored')}
                aria-label={t('habits.ignore')}
              >
                <IconSkip />
              </button>
            )}

            {/* Done */}
            {status === 'pending' && (
              <button
                className="habit-card__check"
                onPointerDown={e => e.stopPropagation()}
                onPointerMove={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={() => onUpdate(habit.id, 'done')}
                aria-label={t('habits.done')}
              >
                <IconCheck />
              </button>
            )}
            {status === 'done' && (
              <button
                className="habit-card__check habit-card__check--done"
                onPointerDown={e => e.stopPropagation()}
                onPointerMove={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                aria-label={t('habits.undone')}
                onClick={() => onUpdate(habit.id, 'pending')}
              >
                <IconCheck />
              </button>
            )}
            {status === 'ignored' && (
              <button
                className="habit-card__check habit-card__check--ignored"
                onPointerDown={e => e.stopPropagation()}
                onPointerMove={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                aria-label={t('habits.revert')}
                onClick={() => onUpdate(habit.id, 'pending')}
              >
                <IconSkip />
              </button>
            )}
          </div>

          {/* Rodapé de status */}
          {status === 'done' && (
            <div className="habit-card__footer habit-card__footer--done">
              <span>
                {completedAt
                  ? t('habits.doneAt', { time: completedAt })
                  : t('habits.doneFeedback')}
              </span>
              <button
                onPointerDown={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={() => onUpdate(habit.id, 'pending')}
              >
                {t('habits.undone')}
              </button>
            </div>
          )}
          {status === 'ignored' && (
            <div className="habit-card__footer habit-card__footer--ignored">
              <span>{t('habits.ignoredFeedback')}</span>
              <button
                onPointerDown={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={() => onUpdate(habit.id, 'pending')}
              >
                {t('habits.revert')}
              </button>
            </div>
          )}
        </div>
      </li>

      {swiped && (
        <div className="habit-card__overlay" onClick={() => setSwiped(false)} />
      )}

      {showEditModal && (
        <EditScopeModal
          onThisDay={() => { setShowEditModal(false); navigate(`/habits?edit=${habit.id}&date=${date}`) }}
          onAllEvents={() => { setShowEditModal(false); navigate(`/habits?edit=${habit.id}`) }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteScopeModal
          onThisDay={() => { setShowDeleteModal(false); deleteHabitDay.mutate({ habitId: habit.id, date }) }}
          onAllEvents={() => { setShowDeleteModal(false); deleteHabit.mutate(habit.id) }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}
