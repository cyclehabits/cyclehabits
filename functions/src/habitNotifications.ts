import * as admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'
import { scheduleNotification, cancelNotification } from './lib/onesignal'

const ONESIGNAL_REST_API_KEY = defineSecret('ONESIGNAL_REST_API_KEY')
const DAYS_AHEAD = 7
const TIMEZONE = 'America/Sao_Paulo'

interface HabitData {
  userId: string
  name: string
  notification?: boolean
  notificationTime?: string
  startDate?: string
  expiresAt?: string
  notificationSchedule?: Record<string, string>
}

function getNextDates(daysAhead: number): Date[] {
  const dates: Date[] = []
  const now = new Date()
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

function buildSendAt(date: Date, timeHHMM: string): Date {
  const [hours, minutes] = timeHHMM.split(':').map(Number)
  // Treat notificationTime as America/Sao_Paulo (UTC-3)
  const utcMs =
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours + 3, minutes)
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

  for (const date of getNextDates(DAYS_AHEAD)) {
    const key = toDateKey(date)

    if (habit.startDate && key < habit.startDate) continue
    if (habit.expiresAt && key > habit.expiresAt) continue

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
