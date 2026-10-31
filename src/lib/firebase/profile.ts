import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types/profile'

export async function getOrCreateProfile(user: User): Promise<void> {
  const ref = doc(db, 'profiles', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const now = new Date().toISOString()
    await setDoc(ref, {
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>
): Promise<void> {
  const ref = doc(db, 'profiles', uid)
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() })
}
