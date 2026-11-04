import * as admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'
import { scheduleNotification, cancelNotification } from './lib/onesignal'

const ONESIGNAL_REST_API_KEY = defineSecret('ONESIGNAL_REST_API_KEY')
const DAYS_AHEAD = 7
const TIMEZONE = 'America/Sao_Paulo'

interface HabitFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'every' | 'once'
  days?: number | number[]
  day?: number
}

interface HabitData {
  userId: string
  name: string
  notification?: boolean
  notificationTime?: string
  startDate?: string
  expiresAt?: string
  frequency?: HabitFrequency
  notificationSchedule?: Record<string, string>
}

function isScheduledForDate(habit: HabitData, dateKey: string): boolean {
  const freq = habit.frequency
  if (!freq || freq.type === 'daily') return true
  if (freq.type === 'once') return true

  const date = new Date(dateKey + 'T00:00:00Z')

  if (freq.type === 'weekly') {
    return Array.isArray(freq.days) && freq.days.includes(date.getUTCDay())
  }
  if (freq.type === 'monthly') {
    return freq.day === date.getUTCDate()
  }
  if (freq.type === 'every') {
    const origin = new Date((habit.startDate ?? dateKey) + 'T00:00:00Z')
    const diff = Math.round((date.getTime() - origin.getTime()) / 86_400_000)
    return typeof freq.days === 'number' && diff % freq.days === 0
  }
  return false
}

function getDatesToSchedule(habit: HabitData): Date[] {
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const startKey = habit.startDate && habit.startDate > todayKey ? habit.startDate : todayKey

  // Use expiresAt as upper bound when shorter than DAYS_AHEAD, otherwise cap at DAYS_AHEAD
  let endKey: string
  if (habit.expiresAt) {
    const maxKey = new Date(today.getTime() + DAYS_AHEAD * 86_400_000)
      .toISOString()
      .slice(0, 10)
    endKey = habit.expiresAt < maxKey ? habit.expiresAt : maxKey
  } else {
    endKey = new Date(today.getTime() + DAYS_AHEAD * 86_400_000)
      .toISOString()
      .slice(0, 10)
  }

  const dates: Date[] = []
  const cursor = new Date(startKey + 'T00:00:00Z')
  const end = new Date(endKey + 'T00:00:00Z')

  while (cursor <= end) {
    dates.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

function buildSendAt(date: Date, timeHHMM: string): Date {
  const [hours, minutes] = timeHHMM.split(':').map(Number)
  // Treat notificationTime as America/Sao_Paulo (UTC-3)
  const utcMs =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours + 3, minutes)
  return new Date(utcMs)
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function cancelAllScheduled(
  apiKey: string,
  schedule: Record<string, string>,
): Promise<void> {
  await Promise.allSettled(
    Object.values(schedule).map((id) => cancelNotification(apiKey, id)),
  )
}

async function scheduleForHabit(
  apiKey: string,
  habitRef: admin.firestore.DocumentReference,
  habit: HabitData,
): Promise<void> {
  if (!habit.notification || !habit.notificationTime) return

  const existingSchedule: Record<string, string> = habit.notificationSchedule ?? {}
  await cancelAllScheduled(apiKey, existingSchedule)

  const newSchedule: Record<string, string> = {}

  for (const date of getDatesToSchedule(habit)) {
    const key = toDateKey(date)

    if (!isScheduledForDate(habit, key)) continue

    const sendAt = buildSendAt(date, habit.notificationTime)

    const notificationId = await scheduleNotification(
      apiKey,
      habit.userId,
      habit.name,
      sendAt,
    )
    newSchedule[key] = notificationId
  }

  await habitRef.update({ notificationSchedule: newSchedule })
}

export const onHabitWrite = onDocumentWritten(
  {
    document: 'users/{userId}/habits/{habitId}',
    secrets: [ONESIGNAL_REST_API_KEY],
  },
  async (event) => {
    const apiKey = ONESIGNAL_REST_API_KEY.value()
    const after = event.data?.after
    const before = event.data?.before

    // Habit deleted
    if (!after?.exists) {
      const habit = before?.data() as HabitData | undefined
      if (habit?.notificationSchedule) {
        await cancelAllScheduled(apiKey, habit.notificationSchedule)
      }
      return
    }

    const habit = after.data() as HabitData

    // Notification disabled
    if (!habit.notification) {
      if (habit.notificationSchedule) {
        await cancelAllScheduled(apiKey, habit.notificationSchedule)
        await after.ref.update({ notificationSchedule: {} })
      }
      return
    }

    await scheduleForHabit(apiKey, after.ref, habit)
  },
)

export const weeklyNotificationRefresh = onSchedule(
  {
    schedule: 'every monday 06:00',
    timeZone: TIMEZONE,
    secrets: [ONESIGNAL_REST_API_KEY],
  },
  async () => {
    const apiKey = ONESIGNAL_REST_API_KEY.value()
    const db = admin.firestore()
    const snapshot = await db.collectionGroup('habits').get()

    await Promise.allSettled(
      snapshot.docs.map(async (doc) => {
        const habit = doc.data() as HabitData
        if (!habit.notification || !habit.notificationTime) return
        await scheduleForHabit(apiKey, doc.ref, habit)
      }),
    )
  },
)
