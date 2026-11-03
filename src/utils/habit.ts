import type { Habit } from '@/types/habit'

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const { frequency } = habit
  const dateStr = formatDate(date)

  // Guard: antes do startDate (fallback para createdAt em registros legados)
  const startDay = habit.startDate ?? habit.createdAt.slice(0, 10)
  if (dateStr < startDay) return false

  // Guard: depois do expiresAt
  if (habit.expiresAt && dateStr > habit.expiresAt) return false

  if (frequency.type === 'once') return true  // guards restringem à startDay apenas
  if (frequency.type === 'daily') return true
  if (frequency.type === 'weekly') return frequency.days.includes(date.getDay())
  if (frequency.type === 'monthly') return frequency.day === date.getDate()
  if (frequency.type === 'every') {
    const origin = new Date(startDay + 'T00:00:00')
    const day    = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diff   = Math.round((day.getTime() - origin.getTime()) / 86_400_000)
    return diff % frequency.days === 0
  }
  return false
}

export function isRecurring(habit: Habit): boolean {
  return habit.frequency.type !== 'once'
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
