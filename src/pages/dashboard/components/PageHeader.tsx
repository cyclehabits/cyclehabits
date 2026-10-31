import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth/useAuth'
import { useProfile } from '@/hooks/useProfile'
import './PageHeader.css'

interface PageHeaderProps {
  date: Date
}

export function PageHeader({ date }: PageHeaderProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { profile } = useProfile()

  const months = t('months.short', { returnObjects: true }) as string[]
  const weekdays = t('weekdays.long', { returnObjects: true }) as string[]

  const isToday = date.toDateString() === new Date().toDateString()

  const label = isToday
    ? t('dashboard.today')
    : `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`

  const displayName = profile?.displayName || user?.displayName || ''
  const firstName = displayName.split(' ')[0]
  const initial = firstName ? firstName[0].toUpperCase() : '?'
  const photoURL = profile?.photoURL || user?.photoURL || ''

  return (
    <header className="page-header">
      <div className="page-header__content">
        <div>
          <p className="page-header__greeting">{t('dashboard.greeting', { name: firstName })}</p>
          <h1 className="page-header__title">{label}</h1>
        </div>
        <button className="page-header__avatar" type="button" aria-label="Perfil">
          {photoURL ? (
            <img
              src={photoURL}
              alt={firstName}
              className="page-header__avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="page-header__avatar-fallback">{initial}</span>
          )}
        </button>
      </div>
    </header>
  )
}
