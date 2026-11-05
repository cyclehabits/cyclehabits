import '@/App.css'
import { BottomNav } from '@/components/nav/BottomNav'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <>
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
