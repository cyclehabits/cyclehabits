import { useTranslation } from 'react-i18next'
import './StreakCard.css'

interface StreakCardProps {
  streak: number
}

export function StreakCard({ streak }: StreakCardProps) {
  const { t } = useTranslation()

  return (
    <div className="streak-card">
      <span className="streak-card__icon">🔥</span>
      <div className="streak-card__body">
        <span className="streak-card__count">{streak}</span>
        <span className="streak-card__label">
          {streak === 1 ? t('history.streak') : t('history.streak_plural')}
        </span>
      </div>
    </div>
  )
}
