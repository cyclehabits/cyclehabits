import { describe, it, expect } from 'vitest'
import { isHabitScheduledForDate, formatDate } from './habit'
import type { Habit } from '@/types/habit'

const base: Habit = {
  id: '1',
  userId: 'u1',
  name: 'Teste',
  frequency: { type: 'daily' },
  createdAt: '2026-01-01',
}

describe('isHabitScheduledForDate', () => {
  it('daily → sempre true', () => {
    expect(isHabitScheduledForDate(base, new Date())).toBe(true)
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
})

describe('formatDate', () => {
  it('formata como YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-10-29'))).toBe('2026-10-29')
  })
})