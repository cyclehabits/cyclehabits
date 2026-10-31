import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import { Switch } from '@awakr/awake-ui/switch'
import { Toggle } from '@awakr/awake-ui/toggle'
import type { Frequency, HabitCategory } from '@/types/habit'
import './HabitForm.css'

export interface HabitFormValues {
  name: string
  description?: string
  frequency: Frequency
  startTime?: string
  endTime?: string
  expiresAt?: string
  category?: HabitCategory
}

interface HabitFormProps {
  initialValues?: Partial<HabitFormValues>
  hideFrequency?: boolean
  onSubmit: (data: HabitFormValues) => void
  onCancel: () => void
  loading?: boolean
}

type FreqType = 'once' | 'daily' | 'weekly' | 'monthly' | 'every'
type DurationUnit = 'day' | 'month' | 'year'

const CATEGORY_CHIPS: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'saude',        label: 'Saúde',        emoji: '❤️' },
  { value: 'energia',      label: 'Energia',       emoji: '⚡' },
  { value: 'mindful',      label: 'Mindful',       emoji: '🧘' },
  { value: 'conhecimento', label: 'Conhecimento',  emoji: '📚' },
  { value: 'outra',        label: 'Outra',         emoji: '✦'  },
]

function calcExpiresAt(value: number, unit: DurationUnit): string {
  const d = new Date()
  if (unit === 'day') d.setDate(d.getDate() + value)
  else if (unit === 'month') d.setMonth(d.getMonth() + value)
  else d.setFullYear(d.getFullYear() + value)
  return d.toISOString().split('T')[0]
}

export function HabitForm({
  initialValues,
  hideFrequency = false,
  onSubmit,
  onCancel,
  loading,
}: HabitFormProps) {
  const { t } = useTranslation()
  const WEEK_DAYS = t('weekdays.short', { returnObjects: true }) as string[]

  const initFreq = initialValues?.frequency
  const initFreqType = (initFreq?.type ?? 'daily') as FreqType

  const [name, setName] = useState(initialValues?.name ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [category, setCategory] = useState<HabitCategory>(initialValues?.category ?? 'outra')
  const [freqType, setFreqType] = useState<FreqType>(initFreqType)
  const [weekDays, setWeekDays] = useState<number[]>(
    initFreq?.type === 'weekly' ? initFreq.days : [],
  )
  const [monthDay, setMonthDay] = useState(
    initFreq?.type === 'monthly' ? initFreq.day : 1,
  )
  const [everyDays, setEveryDays] = useState(
    initFreq?.type === 'every' ? initFreq.days : 2,
  )
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '')
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '')
  const [hasDuration, setHasDuration] = useState(!!initialValues?.expiresAt)
  const [durationValue, setDurationValue] = useState<number | ''>(1)
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('month')

  function toggleWeekDay(day: number) {
    setWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    )
  }

  function buildFrequency(): Frequency {
    if (freqType === 'once') return { type: 'once' }
    if (freqType === 'weekly') return { type: 'weekly', days: weekDays }
    if (freqType === 'monthly') return { type: 'monthly', day: monthDay }
    if (freqType === 'every') return { type: 'every', days: everyDays }
    return { type: 'daily' }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    let expiresAt: string | undefined
    if (hasDuration && durationValue !== '' && durationValue > 0) {
      expiresAt = calcExpiresAt(durationValue, durationUnit)
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency: buildFrequency(),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      expiresAt,
      category,
    })
  }

  const FREQ_LABELS: Record<FreqType, string> = {
    once: t('habits.form.once'),
    daily: t('habits.form.daily'),
    weekly: t('habits.form.weekly'),
    monthly: t('habits.form.monthly'),
    every: t('habits.form.every'),
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

      <div className="habit-form__field">
        <label className="habit-form__label">{t('habits.form.category')}</label>
        <div className="habit-form__category-chips">
          {CATEGORY_CHIPS.map(c => (
            <button
              key={c.value}
              type="button"
              className={`habit-form__category-chip habit-form__category-chip--${c.value}${
                category === c.value ? ' habit-form__category-chip--active' : ''
              }`}
              onClick={() => setCategory(c.value)}
            >
              <span aria-hidden="true">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Field.Root>
        <Field.Label>{t('habits.form.description')}</Field.Label>
        <Field.Control
          type="text"
          placeholder={t('habits.form.descriptionPlaceholder')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </Field.Root>

      {!hideFrequency && (
        <>
          <div className="habit-form__field">
            <label className="habit-form__label">{t('habits.form.frequency')}</label>
            <div className="habit-form__freq-tabs">
              {(['once', 'daily', 'weekly', 'monthly', 'every'] as FreqType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  className={`habit-form__freq-tab${freqType === type ? ' habit-form__freq-tab--active' : ''}`}
                  onClick={() => setFreqType(type)}
                >
                  {FREQ_LABELS[type]}
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

          {freqType === 'every' && (
            <div className="habit-form__field">
              <label className="habit-form__label">{t('habits.form.every')}</label>
              <div className="habit-form__every">
                <Field.Control
                  type="number"
                  min={1}
                  max={365}
                  value={everyDays}
                  onChange={e => setEveryDays(Math.max(1, Number(e.target.value)))}
                />
                <span className="habit-form__every-label">{t('habits.form.everyDays')}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="habit-form__time-row">
        <div className="habit-form__field habit-form__field--half">
          <label className="habit-form__label">{t('habits.form.startTime')}</label>
          <Field.Control
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <div className="habit-form__field habit-form__field--half">
          <label className="habit-form__label">{t('habits.form.endTime')}</label>
          <Field.Control
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="habit-form__field">
        <div className="habit-form__duration-header">
          <label className="habit-form__label">{t('habits.form.duration')}</label>
          <Switch.Root
            checked={hasDuration}
            onCheckedChange={setHasDuration}
            aria-label={t('habits.form.duration')}
          >
            <Switch.Thumb />
          </Switch.Root>
        </div>
        <div className="habit-form__duration-row">
          <Field.Control
            type="number"
            min={1}
            max={999}
            value={durationValue}
            disabled={!hasDuration}
            onChange={e =>
              setDurationValue(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))
            }
            className="habit-form__duration-value"
          />
          {(['day', 'month', 'year'] as DurationUnit[]).map(unit => (
            <Toggle
              key={unit}
              checked={durationUnit === unit}
              onCheckedChange={() => setDurationUnit(unit)}
              disabled={!hasDuration}
            >
              {t(`habits.form.duration${unit.charAt(0).toUpperCase() + unit.slice(1)}`)}
            </Toggle>
          ))}
        </div>
      </div>

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
