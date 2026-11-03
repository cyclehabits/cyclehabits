import { describe, it, expect } from 'vitest'
import { isHabitScheduledForDate, formatDate } from './habit'
import type { Habit } from '@/types/habit'

const base: Habit = {
  id: '1',
  userId: 'u1',
  name: 'Teste',
  frequency: { type: 'daily' },
  startDate: '2026-01-01',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('isHabitScheduledForDate — guards', () => {
  it('não exibe antes do startDate', () => {
    const habit: Habit = { ...base, startDate: '2026-11-05' }
    expect(isHabitScheduledForDate(habit, new Date('2026-11-04'))).toBe(false)
  })

  it('exibe na data do startDate', () => {
    const habit: Habit = { ...base, startDate: '2026-11-04' }
    expect(isHabitScheduledForDate(habit, new Date('2026-11-04'))).toBe(true)
  })

  it('não exibe após o expiresAt', () => {
    const habit: Habit = { ...base, expiresAt: '2026-10-31' }
    expect(isHabitScheduledForDate(habit, new Date('2026-11-01'))).toBe(false)
  })

  it('exibe na data do expiresAt', () => {
    const habit: Habit = { ...base, expiresAt: '2026-11-01' }
    expect(isHabitScheduledForDate(habit, new Date('2026-11-01'))).toBe(true)
  })

  it('fallback para createdAt quando startDate ausente (registros legados)', () => {
    const legacy: Habit = { ...base, startDate: undefined, createdAt: '2026-11-03T00:00:00.000Z' }
    expect(isHabitScheduledForDate(legacy, new Date('2026-11-02'))).toBe(false)
    expect(isHabitScheduledForDate(legacy, new Date('2026-11-03'))).toBe(true)
  })
})

describe('isHabitScheduledForDate — frequências', () => {
  it('daily → true dentro do período', () => {
    expect(isHabitScheduledForDate(base, new Date('2026-06-15'))).toBe(true)
  })

  it('once → true apenas no startDate, false em outra data', () => {
    const habit: Habit = {
      ...base,
      frequency: { type: 'once' },
      startDate: '2026-10-26',
      expiresAt: '2026-10-26',
    }
    expect(isHabitScheduledForDate(habit, new Date('2026-10-26'))).toBe(true)
    expect(isHabitScheduledForDate(habit, new Date('2026-10-27'))).toBe(false)
  })

  it('weekly → true no dia correto', () => {
    const monday = new Date('2026-10-26') // segunda = 1
    const habit: Habit = { ...base, frequency: { type: 'weekly', days: [1] } }
    expect(isHabitScheduledForDate(habit, monday)).toBe(true)
  })

  it('weekly → false no dia errado', () => {
    const tuesday = new Date('2026-10-27') // terça = 2
    const habit: Habit = { ...base, frequency: { type: 'weekly', days: [1] } }
    expect(isHabitScheduledForDate(habit, tuesday)).toBe(false)
  })

  it('monthly → true no dia correto', () => {
    const day15 = new Date('2026-10-15')
    const habit: Habit = { ...base, frequency: { type: 'monthly', day: 15 } }
    expect(isHabitScheduledForDate(habit, day15)).toBe(true)
  })

  it('every 2 dias → true na data certa, false na errada', () => {
    const habit: Habit = { ...base, startDate: '2026-11-01', frequency: { type: 'every', days: 2 } }
    expect(isHabitScheduledForDate(habit, new Date('2026-11-01'))).toBe(true)  // diff=0
    expect(isHabitScheduledForDate(habit, new Date('2026-11-02'))).toBe(false) // diff=1
    expect(isHabitScheduledForDate(habit, new Date('2026-11-03'))).toBe(true)  // diff=2
  })
})

describe('formatDate', () => {
  it('formata como YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-10-29'))).toBe('2026-10-29')
  })
})
