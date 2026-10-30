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
  time?: string          // "HH:MM"
  duration?: number      // minutos
  createdAt: string
  archivedAt?: string
}

export interface HabitOverride {
  id: string
  habitId: string
  date: string           // YYYY-MM-DD — identifica a ocorrência
  name?: string
  description?: string
  time?: string
  duration?: number
}

export interface HabitLog {
  habitId: string
  date: string           // YYYY-MM-DD
  status: HabitStatus
  note?: string
  completedAt?: string
}
