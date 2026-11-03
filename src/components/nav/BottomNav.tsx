import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <div className="nav-brand__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        CycleHabits
      </div>

      <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>{t('nav.dashboard')}</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span>{t('nav.history')}</span>
      </NavLink>

      <NavLink to="/habits" className="nav-fab" aria-label={t('nav.habits')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span className="nav-fab__label">{t('nav.habits')}</span>
      </NavLink>

      <NavLink to="/stats" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span>{t('nav.stats')}</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>{t('nav.profile')}</span>
      </NavLink>
    </nav>
  )
}
