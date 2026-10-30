import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/auth/useAuth'
import './PageHeader.css'

interface PageHeaderProps {
  date: Date
}

export function PageHeader({ date }: PageHeaderProps) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const months = t('months.short', { returnObjects: true }) as string[]
  const weekdays = t('weekdays.long', { returnObjects: true }) as string[]

  const isToday = date.toDateString() === new Date().toDateString()

  const label = isToday
    ? t('nav.today')
    : `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`

  const firstName = user?.displayName?.split(' ')[0] ?? ''

  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{label}</h1>
        {isToday && (
          <p className="page-header__sub">{t('today.greeting', { name: firstName })}</p>
        )}
      </div>
    </header>
  )
}
