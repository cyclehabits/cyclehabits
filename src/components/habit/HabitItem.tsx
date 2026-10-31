import { useState } from 'react'
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

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
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

const CATEGORY_META: Record<HabitCategory, { icon: React.ReactNode; label: string; emoji: string }> = {
  saude:        { icon: <IconSaude />,        label: 'Saúde',        emoji: '💊' },
  energia:      { icon: <IconEnergia />,      label: 'Energia',      emoji: '⚡' },
  mindful:      { icon: <IconMindful />,      label: 'Mindful',      emoji: '🧘' },
  conhecimento: { icon: <IconConhecimento />, label: 'Conhecimento', emoji: '📚' },
  outra:        { icon: <IconOutra />,        label: 'Outra',        emoji: '⭐' },
}

function derivePeriod(startTime?: string): string {
  if (!startTime) return ''
  const [h] = startTime.split(':').map(Number)
  if (h < 12) return 'Manhã'
  if (h < 18) return 'Tarde'
  return 'Noite'
}

// ── Componente principal ──────────────────────────────────────────────────────

export function HabitItem({ habit, log, override, date, onUpdate }: HabitItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const deleteHabit    = useDeleteHabit()
  const deleteHabitDay = useDeleteHabitDay()

  const status           = log?.status ?? 'pending' as HabitStatus
  const displayName      = override?.name     ?? habit.name
  const displayStartTime = override?.startTime ?? habit.startTime
  const category         = habit.category ?? 'outra'
  const meta             = CATEGORY_META[category]
  const period           = derivePeriod(displayStartTime)
  const timeMeta         = displayStartTime
    ? period ? `${displayStartTime} · ${period}` : displayStartTime
    : null

  const completedAt = log?.completedAt
    ? new Date(log.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  function handleEditClick() {
    setShowMenu(false)
    if (!isRecurring(habit)) navigate(`/habits?edit=${habit.id}`)
    else setShowEditModal(true)
  }

  function handleDeleteClick() {
    setShowMenu(false)
    if (!isRecurring(habit)) deleteHabit.mutate(habit.id)
    else setShowDeleteModal(true)
  }

  return (
    <>
      <li className={`habit-card habit-card--${status} habit-card--${category}`}>

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

        {/* Botão de check + menu */}
        <div className="habit-card__right">
          {status === 'pending' && (
            <button
              className="habit-card__check"
              onClick={() => onUpdate(habit.id, 'done')}
              aria-label={t('habits.done')}
            >
              <IconCheck />
            </button>
          )}
          {status === 'done' && (
            <button
              className="habit-card__check habit-card__check--done"
              onClick={() => onUpdate(habit.id, 'pending')}
              aria-label="Desfazer"
            >
              <IconCheck />
            </button>
          )}
          {status === 'ignored' && (
            <button
              className="habit-card__check habit-card__check--ignored"
              onClick={() => onUpdate(habit.id, 'pending')}
              aria-label="Reverter"
            >
              <IconSkip />
            </button>
          )}

          <div className="habit-card__menu-wrap">
            <button
              className="habit-card__menu-btn"
              onClick={() => setShowMenu(v => !v)}
              aria-label="Opções"
            >
              <IconMenu />
            </button>
            {showMenu && (
              <div className="habit-card__menu-dropdown">
                {status === 'pending' && (
                  <button onClick={() => { setShowMenu(false); onUpdate(habit.id, 'ignored') }}>
                    <IconSkip /> {t('habits.ignore')}
                  </button>
                )}
                <button onClick={handleEditClick}>✏️ {t('habits.edit')}</button>
                <button
                  className="habit-card__menu-delete"
                  onClick={handleDeleteClick}
                >
                  🗑️ {t('habits.delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de status */}
        {status === 'done' && (
          <div className="habit-card__footer habit-card__footer--done">
            <span>✓ Concluído{completedAt ? ` às ${completedAt}` : ''}</span>
            <button onClick={() => onUpdate(habit.id, 'pending')}>Desfazer</button>
          </div>
        )}
        {status === 'ignored' && (
          <div className="habit-card__footer habit-card__footer--ignored">
            <span>Ignorado hoje</span>
            <button onClick={() => onUpdate(habit.id, 'pending')}>Reverter</button>
          </div>
        )}
      </li>

      {showMenu && (
        <div className="habit-card__overlay" onClick={() => setShowMenu(false)} />
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
