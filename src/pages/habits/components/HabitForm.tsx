import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import type { Frequency } from '@/types/habit'
import './HabitForm.css'

interface HabitFormProps {
  onSubmit: (data: { name: string; description?: string; frequency: Frequency }) => void
  onCancel: () => void
  loading?: boolean
}

export function HabitForm({ onSubmit, onCancel, loading }: HabitFormProps) {
  const { t } = useTranslation()
  const WEEK_DAYS = t('weekdays.short', { returnObjects: true }) as string[]

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [freqType, setFreqType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [weekDays, setWeekDays] = useState<number[]>([])
  const [monthDay, setMonthDay] = useState(1)

  function toggleWeekDay(day: number) {
    setWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    let frequency: Frequency
    if (freqType === 'daily') frequency = { type: 'daily' }
    else if (freqType === 'weekly') frequency = { type: 'weekly', days: weekDays }
    else frequency = { type: 'monthly', day: monthDay }

    onSubmit({ name: name.trim(), description: description.trim() || undefined, frequency })
  }

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <Field.Root>
        <Field.Label>{t('habits.form.name')} *</Field.Label>
        <Field.Control
          type="text"
          placeholder={t('habits.form.namePlaceholder')}
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>{t('habits.form.description')}</Field.Label>
        <Field.Control
          type="text"
          placeholder={t('habits.form.descriptionPlaceholder')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Field.Root>

      <div className="habit-form__field">
        <label className="habit-form__label">{t('habits.form.frequency')}</label>
        <div className="habit-form__freq-tabs">
          {(['daily', 'weekly', 'monthly'] as const).map(type => (
            <button
              key={type}
              type="button"
              className={`habit-form__freq-tab${freqType === type ? ' habit-form__freq-tab--active' : ''}`}
              onClick={() => setFreqType(type)}
            >
              {{ daily: t('habits.form.daily'), weekly: t('habits.form.weekly'), monthly: t('habits.form.monthly') }[type]}
            </button>
          ))}
        </div>
      </div>

      {freqType === 'weekly' && (
        <div className="habit-form__field">
          <label className="habit-form__label">{t('habits.form.days')}</label>
          <div className="habit-form__weekdays">
            {WEEK_DAYS.map((label, i) => (
              <button
                key={i}
                type="button"
                className={`habit-form__weekday${weekDays.includes(i) ? ' habit-form__weekday--active' : ''}`}
                onClick={() => toggleWeekDay(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {freqType === 'monthly' && (
        <Field.Root>
          <Field.Label>{t('habits.form.day')}</Field.Label>
          <Field.Control
            type="number"
            min={1}
            max={31}
            value={monthDay}
            onChange={e => setMonthDay(Number(e.target.value))}
          />
        </Field.Root>
      )}

      <div className="habit-form__actions">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          {t('habits.form.cancel')}
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={loading || !name.trim()}>
          {loading ? '…' : t('habits.form.save')}
        </Button>
      </div>
    </form>
  )
}
