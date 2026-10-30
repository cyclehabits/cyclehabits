import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import PrivateRoute from './PrivateRoute'
import { Loading } from '@awakr/awake-ui/loading'

const LoginPage    = lazy(() => import('@/pages/login/LoginPage'))
const TodayPage    = lazy(() => import('@/pages/today/TodayPage'))
const HabitsPage   = lazy(() => import('@/pages/habits/HabitsPage'))
const HistoryPage  = lazy(() => import('@/pages/history/HistoryPage'))
const StatsPage    = lazy(() => import('@/pages/stats/StatsPage'))
const ProfilePage  = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Loading size="md" />
    </div>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
