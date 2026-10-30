export type HabitStatus = 'pending' | 'done' | 'ignored'

export type Frequency =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }   // 0=Dom, 1=Seg...
  | { type: 'monthly'; day: number }

export interface Habit {
  id: string
  userId: string
  name: string
  description?: string
  frequency: Frequency
  createdAt: string
  archivedAt?: string
}

export interface HabitLog {
  habitId: string
  date: string        // YYYY-MM-DD
  status: HabitStatus
  note?: string
  completedAt?: string
}