import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/login/LoginPage'
import TodayPage from '@/pages/today/TodayPage'
import HabitsPage from '@/pages/habits/HabitsPage'
import HistoryPage from '@/pages/history/HistoryPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import PrivateRoute from './PrivateRoute'

export default function Router() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}