import { useState } from 'react'
import i18n from '@/i18n'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useTheme } from '@/contexts/theme/useTheme'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import { Tabs } from '@awakr/awake-ui/tabs'
import { Alert } from '@awakr/awake-ui/alert'
import { auth } from '@/lib/firebase/auth'
import './LoginPage.css'

const LANGUAGES = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { canInstall, install } = useInstallPrompt()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/today')
    } catch {
      setError(t('login.error_invalid'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
      navigate('/today')
    } catch {
      setError(t('login.error_signup'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/today')
    } catch (err) {
      console.error('Google auth error:', err)
      setError(t('login.error_google'))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError(t('login.error_forgot'))
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setError('')
    } catch {
      setError(t('login.error_forgot'))
    }
  }

  return (
    <div className="login-page">
      <div className="login-topbar">
        <div className="login-lang-group">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`login-lang-btn${i18n.language === lang.code ? ' login-lang-btn--active' : ''}`}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button className="login-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="login-hero">
        <div className="app-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/>
            <path d="M8 12l3 3 5-5"/>
          </svg>
        </div>
        <div>
          <p className="app-name">{t('login.title')}</p>
          <p className="app-tagline">{t('login.subtitle')}</p>
        </div>
      </div>

      <div className="login-card">
        {error && <Alert variant="error">{error}</Alert>}

        <Tabs.Root defaultValue="signin" onValueChange={() => setError('')}>
          <Tabs.List>
            <Tabs.Tab value="signin">{t('login.tab_signin')}</Tabs.Tab>
            <Tabs.Tab value="signup">{t('login.tab_signup')}</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>

          <Tabs.Panel value="signin">
            <form onSubmit={handleSignIn} className="flex flex-col gap-4 pt-4">
              <Field.Root>
                <Field.Label>{t('login.email')}</Field.Label>
                <Field.Control
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root>
                <div className="flex justify-between items-center mb-1">
                  <Field.Label>{t('login.password')}</Field.Label>
                  <button type="button" className="login-link" onClick={handleForgotPassword}>
                    {t('login.forgot')}
                  </button>
                </div>
                <Field.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </Field.Root>

              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? t('login.signin_loading') : t('login.signin_btn')}
              </Button>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="signup">
            <form onSubmit={handleSignUp} className="flex flex-col gap-4 pt-4">
              <div className="flex gap-3">
                <Field.Root className="flex-1">
                  <Field.Label>{t('login.first_name')}</Field.Label>
                  <Field.Control
                    type="text"
                    placeholder="Ana"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </Field.Root>
                <Field.Root className="flex-1">
                  <Field.Label>{t('login.last_name')}</Field.Label>
                  <Field.Control
                    type="text"
                    placeholder="Silva"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </Field.Root>
              </div>

              <Field.Root>
                <Field.Label>{t('login.email')}</Field.Label>
                <Field.Control
                  type="email"
                  placeholder="you@email.com"
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{t('login.password')}</Field.Label>
                <Field.Control
                  type="password"
                  placeholder={t('login.password_placeholder')}
                  value={signUpPassword}
                  onChange={e => setSignUpPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field.Root>

              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? t('login.signup_loading') : t('login.signup_btn')}
              </Button>
            </form>
          </Tabs.Panel>
        </Tabs.Root>

        <div className="login-divider">{t('login.or')}</div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: '100%', gap: '0.75rem' }}
        >
          <GoogleIcon />
          {t('login.google')}
        </Button>
      </div>

      {canInstall && (
        <button className="login-install-btn" onClick={install}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {t('settings.install')}
        </button>
      )}

      <p className="login-footer">
        {t('login.terms')}{' '}
        <a href="#">{t('login.terms_link')}</a> {t('login.terms_and')}{' '}
        <a href="#">{t('login.privacy_link')}</a>.
      </p>
    </div>
  )
}
