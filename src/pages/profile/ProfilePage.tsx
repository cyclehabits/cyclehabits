import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useTheme } from '@/contexts/theme/useTheme'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useAuth } from '@/contexts/auth/useAuth'
import { Button } from '@awakr/awake-ui/button'
import './ProfilePage.css'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { canInstall, install } = useInstallPrompt()
  const { user, signOut } = useAuth()

  return (
    <div className="profile-page">
      <div className="profile-page__inner">
        <h1 className="profile-title">{t('nav.profile')}</h1>

        <section className="profile-section profile-section--user">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName ?? ''}
              className="profile-avatar"
            />
          )}
          <div>
            <p className="profile-name">{user?.displayName}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__label">{t('settings.language')}</h2>
          <div className="profile-lang-group">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`profile-lang-btn${i18n.language === lang.code ? ' profile-lang-btn--active' : ''}`}
                onClick={() => i18n.changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__label">{t('settings.theme')}</h2>
          <button className="profile-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? `☀️  ${t('settings.light')}` : `🌙  ${t('settings.dark')}`}
          </button>
        </section>

        {canInstall && (
          <section className="profile-section">
            <button className="profile-theme-btn" onClick={install}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t('settings.install')}
            </button>
          </section>
        )}

        <section className="profile-section profile-section--logout">
          <Button variant="ghost" size="md" onClick={signOut}>
            {t('settings.logout')}
          </Button>
        </section>
      </div>
    </div>
  )
}
