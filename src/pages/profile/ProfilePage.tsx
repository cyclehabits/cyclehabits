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
            <Button variant="outline" size="md" onClick={install}>
              ⬇️  {t('settings.install')}
            </Button>
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
