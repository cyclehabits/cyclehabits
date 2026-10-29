import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { app } from './firebase'

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
})