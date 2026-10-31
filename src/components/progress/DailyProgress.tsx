import { useTranslation } from 'react-i18next'
import { Progress } from '@awakr/awake-ui/progress'
import '@/components/progress/DailyProgress.css'

interface DailyProgressProps {
  done: number
  ignored: number
  total: number
}

export function DailyProgress({ done, ignored, total }: DailyProgressProps) {
  const { t } = useTranslation()
  const pct       = total === 0 ? 0 : Math.round((done / total) * 100)
  const remaining = total - done - ignored

  return (
    <div className="dp-card">
      <div className="dp-card__header">
        <span className="dp-card__title">{t('dashboard.progress')}</span>
        <span className="dp-card__pct">{pct}%</span>
      </div>

      <Progress.Root value={pct} className="dp-card__bar-root">
        <Progress.Track className="dp-card__bar-track">
          <Progress.Indicator className="dp-card__bar-fill" />
        </Progress.Track>
      </Progress.Root>

      <div className="dp-card__chips">
        {done > 0 && (
          <span className="dp-chip dp-chip--done">✅ {done} {t('dashboard.done')}</span>
        )}
        {ignored > 0 && (
          <span className="dp-chip dp-chip--ignored">⏭ {ignored} {t('dashboard.ignored')}</span>
        )}
        {remaining > 0 && (
          <span className="dp-chip dp-chip--remaining">○ {remaining} {t('dashboard.remaining')}</span>
        )}
        {total === 0 && (
          <span className="dp-chip dp-chip--empty">{t('dashboard.noHabits')}</span>
        )}
      </div>

      {pct === 100 && total > 0 && (
        <p className="dp-card__congrats">🎉 {t('dashboard.congrats')}</p>
      )}
    </div>
  )
}
