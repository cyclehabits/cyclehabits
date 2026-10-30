import '@/components/progress/DailyProgress.css'

interface DailyProgressProps {
  done: number
  total: number
}

export function DailyProgress({ done, total }: DailyProgressProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="daily-progress">
      <div className="daily-progress__header">
        <span className="daily-progress__label">Progresso do dia</span>
        <span className="daily-progress__count">{done}/{total}</span>
      </div>
      <div className="daily-progress__bar-track">
        <div
          className="daily-progress__bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {pct === 100 && total > 0 && (
        <p className="daily-progress__congrats">🎉 Todos os hábitos concluídos!</p>
      )}
    </div>
  )
}