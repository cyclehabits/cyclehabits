export type HabitStatus = 'pending' | 'done' | 'ignored'

export type Frequency =
  | { type: 'once' }
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }   // 0=Dom, 1=Seg...
  | { type: 'monthly'; day: number }
  | { type: 'every'; days: number }      // a cada N dias desde a criação

export interface Habit {
  id: string
  userId: string
  name: string
  description?: string
  frequency: Frequency
  startTime?: string     // "HH:MM"
  endTime?: string       // "HH:MM"
  expiresAt?: string     // "YYYY-MM-DD" — hábito para de aparecer após esta data
  createdAt: string
  archivedAt?: string
}

export interface HabitOverride {
  id: string
  habitId: string
  date: string           // YYYY-MM-DD
  name?: string
  description?: string
  startTime?: string
  endTime?: string
}

export interface HabitLog {
  habitId: string
  date: string           // YYYY-MM-DD
  status: HabitStatus
  note?: string
  completedAt?: string
}
