import { useAuth } from '@/contexts/auth/useAuth'
import './PageHeader.css'

interface PageHeaderProps {
  date: Date
}

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const WEEKDAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export function PageHeader({ date }: PageHeaderProps) {
  const { user } = useAuth()
  const isToday = date.toDateString() === new Date().toDateString()

  const label = isToday
    ? 'Hoje'
    : `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`

  const firstName = user?.displayName?.split(' ')[0] ?? 'você'

  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{label}</h1>
        {isToday && (
          <p className="page-header__sub">Olá, {firstName} 👋</p>
        )}
      </div>
    </header>
  )
}