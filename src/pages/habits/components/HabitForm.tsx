import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import type { Frequency } from '@/types/habit'
import './HabitForm.css'

export interface HabitFormValues {
  name: string
  description?: string
  frequency: Frequency
  time?: string
  duration?: number
}

interface HabitFormProps {
  initialValues?: Partial<HabitFormValues>
  hideFrequency?: boolean
  onSubmit: (data: HabitFormValues) => void
  onCancel: () => void
  loading?: boolean
}

type FreqType = 'once' | 'daily' | 'weekly' | 'monthly' | 'every'

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

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
  const [time, setTime] = useState(initialValues?.time ?? '')
  const [duration, setDuration] = useState<number | ''>(initialValues?.duration ?? '')

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
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency: buildFrequency(),
      time: time || undefined,
      duration: duration !== '' ? duration : undefined,
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

      <div className="habit-form__field">
        <label className="habit-form__label">{t('habits.form.time')}</label>
        <Field.Control
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>

      <div className="habit-form__field">
        <label className="habit-form__label">{t('habits.form.duration')}</label>
        <select
          className="habit-form__select"
          value={duration}
          onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">{t('habits.form.durationNone')}</option>
          {DURATION_OPTIONS.map(min => (
            <option key={min} value={min}>
              {min} {t('habits.form.durationMin')}
            </option>
          ))}
        </select>
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
