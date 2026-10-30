import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useTheme } from '@/contexts/theme/useTheme'
import { useAuth } from '@/contexts/auth/useAuth'
import { Button } from '@awakr/awake-ui/button'
import './SettingsPage.css'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useAuth()

  return (
    <div className="settings-page">
      <div className="settings-page__inner">
        <h1 className="settings-title">{t('settings.title')}</h1>

        <section className="settings-section">
          <h2 className="settings-section__label">{t('settings.language')}</h2>
          <div className="settings-lang-group">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`settings-lang-btn${i18n.language === lang.code ? ' settings-lang-btn--active' : ''}`}
                onClick={() => i18n.changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__label">{t('settings.theme')}</h2>
          <button className="settings-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? `☀️  ${t('settings.light')}` : `🌙  ${t('settings.dark')}`}
          </button>
        </section>

        <section className="settings-section settings-section--logout">
          <Button variant="ghost" size="md" onClick={signOut}>
            {t('settings.logout')}
          </Button>
        </section>
      </div>
    </div>
  )
}
