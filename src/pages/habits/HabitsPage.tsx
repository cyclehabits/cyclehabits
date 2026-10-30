import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { useHabits } from '@/hooks/useHabits'
import { useCreateHabit } from '@/hooks/useCreateHabit'
import { useArchiveHabit } from '@/hooks/useArchiveHabit'
import { HabitForm } from './components/HabitForm'
import type { Frequency } from '@/types/habit'
import './HabitsPage.css'

export default function HabitsPage() {
  const { t } = useTranslation()
  const { habits, loading } = useHabits()
  const { mutate: createHabit, isPending: creating } = useCreateHabit()
  const { mutate: archiveHabit } = useArchiveHabit()
  const [showForm, setShowForm] = useState(false)

  const FREQ_LABEL: Record<string, string> = {
    daily: t('habits.form.daily'),
    weekly: t('habits.form.weekly'),
    monthly: t('habits.form.monthly'),
  }

  function handleCreate(data: { name: string; description?: string; frequency: Frequency }) {
    createHabit(data, { onSuccess: () => setShowForm(false) })
  }

  return (
    <div className="habits-page">
      <div className="habits-page__inner">
        <div className="habits-page__header">
          <h1 className="habits-page__title">{t('habits.title')}</h1>
          {!showForm && (
            <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
              + {t('habits.add')}
            </Button>
          )}
        </div>

        {showForm && (
          <div className="habits-page__form-card">
            <HabitForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={creating}
            />
          </div>
        )}

        {loading ? (
          <p className="habits-page__empty">{t('today.loading')}</p>
        ) : habits.length === 0 && !showForm ? (
          <p className="habits-page__empty">{t('habits.empty')}</p>
        ) : (
          <ul className="habits-page__list">
            {habits.map(habit => (
              <li key={habit.id} className="habits-page__item">
                <div className="habits-page__item-info">
                  <span className="habits-page__item-name">{habit.name}</span>
                  <span className="habits-page__item-freq">
                    {FREQ_LABEL[habit.frequency.type]}
                    {habit.frequency.type === 'weekly' &&
                      ` · ${habit.frequency.days.length}x/sem`}
                  </span>
                </div>
                <button
                  className="habits-page__item-archive"
                  onClick={() => archiveHabit(habit.id)}
                  aria-label={t('habits.archive')}
                >
                  🗄
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
