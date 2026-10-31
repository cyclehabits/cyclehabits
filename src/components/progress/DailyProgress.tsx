import { useTranslation } from 'react-i18next'
import { Progress } from '@awakr/awake-ui/progress'
import '@/components/progress/DailyProgress.css'

interface DailyProgressProps {
  done: number
  total: number
}

export function DailyProgress({ done, total }: DailyProgressProps) {
  const { t } = useTranslation()
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="daily-progress">
      <Progress.Root value={pct} className="daily-progress__root">
        <div className="daily-progress__header">
          <Progress.Label className="daily-progress__label">
            {t('dashboard.progress')}
          </Progress.Label>
          <span className="daily-progress__count">{done}/{total}</span>
        </div>
        <Progress.Track className="daily-progress__bar-track">
          <Progress.Indicator className="daily-progress__bar-fill" />
        </Progress.Track>
      </Progress.Root>
      {pct === 100 && total > 0 && (
        <p className="daily-progress__congrats">{t('dashboard.congrats')}</p>
      )}
    </div>
  )
}
