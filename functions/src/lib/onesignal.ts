const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID as string
const BASE_URL = 'https://onesignal.com/api/v1'

function getHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Key ${apiKey}`,
  }
}

export async function scheduleNotification(
  apiKey: string,
  externalUserId: string,
  habitName: string,
  sendAt: Date,
): Promise<string> {
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [externalUserId] },
    target_channel: 'push',
    headings: { en: 'CycleHabits', pt: 'CycleHabits' },
    contents: { en: habitName, pt: habitName },
    send_after: sendAt.toUTCString(),
  }

  const response = await fetch(`${BASE_URL}/notifications`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OneSignal schedule failed: ${error}`)
  }

  const data = (await response.json()) as { id: string }
  return data.id
}

export async function cancelNotification(
  apiKey: string,
  notificationId: string,
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/notifications/${notificationId}?app_id=${ONESIGNAL_APP_ID}`,
    {
      method: 'DELETE',
      headers: getHeaders(apiKey),
    },
  )

  if (!response.ok && response.status !== 404) {
    const error = await response.text()
    throw new Error(`OneSignal cancel failed: ${error}`)
  }
}
