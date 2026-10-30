import type { Habit } from '@/types/habit'

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const { frequency } = habit
  if (frequency.type === 'daily') return true
  if (frequency.type === 'weekly') return frequency.days.includes(date.getDay())
  if (frequency.type === 'monthly') return frequency.day === date.getDate()
  return false
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}