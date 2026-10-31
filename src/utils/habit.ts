import type { Habit } from '@/types/habit'

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const { frequency } = habit

  if (frequency.type === 'once') {
    return habit.createdAt.startsWith(formatDate(date))
  }
  if (frequency.type === 'daily') return true
  if (frequency.type === 'weekly') return frequency.days.includes(date.getDay())
  if (frequency.type === 'monthly') return frequency.day === date.getDate()
  if (frequency.type === 'every') {
    const o = new Date(habit.createdAt)
    // Normaliza para meia-noite local para evitar problemas de fuso horário
    const origin = new Date(o.getFullYear(), o.getMonth(), o.getDate())
    const day   = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diff  = Math.round((day.getTime() - origin.getTime()) / 86_400_000)
    return diff >= 0 && diff % frequency.days === 0
  }
  return false
}

export function isRecurring(habit: Habit): boolean {
  return habit.frequency.type !== 'once'
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
