import { useMemo, useRef, useEffect, useState } from 'react'
import './WeekStrip.css'

interface WeekStripProps {
  selected: Date
  onChange: (date: Date) => void
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

const WEEKS_BACK = 12
const WEEKS_FORWARD = 2

export function WeekStrip({ selected, onChange }: WeekStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  const todayStr = toLocalDateStr(today)
  const selectedStr = toLocalDateStr(selected)

  const [visibleMonth, setVisibleMonth] = useState<string>(() => {
    return `${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
  })

  const weeks = useMemo(() => {
    const currentWeekStart = getWeekStart(today)
    return Array.from({ length: WEEKS_BACK + 1 + WEEKS_FORWARD }, (_, wi) => {
      const weekStart = new Date(currentWeekStart)
      weekStart.setDate(currentWeekStart.getDate() + (wi - WEEKS_BACK) * 7)
      return Array.from({ length: 7 }, (_, di) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + di)
        return d
      })
    })
  }, [])

  // Scroll para a semana do selected na montagem
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const selectedWeekStart = toLocalDateStr(getWeekStart(selected))
    const weekEls = el.querySelectorAll<HTMLElement>('[data-week-start]')
    weekEls.forEach(weekEl => {
      if (weekEl.dataset.weekStart === selectedWeekStart) {
        weekEl.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
      }
    })
  }, [])

  // IntersectionObserver para detectar semana visível
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting && e.intersectionRatio >= 0.5)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) {
          const weekStart = (visible.target as HTMLElement).dataset.weekStart
          if (weekStart) {
            const d = new Date(weekStart + 'T12:00:00')
            // usa o mês da quarta-feira da semana (dia 3) para evitar ambiguidade
            const wednesday = new Date(d)
            wednesday.setDate(d.getDate() + 3)
            setVisibleMonth(`${MONTHS[wednesday.getMonth()]} ${wednesday.getFullYear()}`)
          }
        }
      },
      { root: el, threshold: 0.5 }
    )

    el.querySelectorAll<HTMLElement>('[data-week-start]').forEach(w => observer.observe(w))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="week-strip-wrapper">
      <span className="week-strip-month">{visibleMonth}</span>
      <div className="week-strip-scroll" ref={scrollRef}>
        {weeks.map((days) => {
          const weekStart = toLocalDateStr(days[0])
          return (
            <div key={weekStart} className="week-strip" data-week-start={weekStart}>
              {days.map((day) => {
                const str = toLocalDateStr(day)
                const isToday = str === todayStr
                const isSelected = str === selectedStr
                const isFuture = str > todayStr

                return (
                  <button
                    key={str}
                    disabled={isFuture}
                    className={`week-strip__day${isToday ? ' week-strip__day--today' : ''}${isSelected ? ' week-strip__day--selected' : ''}`}
                    onClick={() => onChange(day)}
                  >
                    <span className="week-strip__label">{DAYS_SHORT[day.getDay()]}</span>
                    <span className="week-strip__num">{day.getDate()}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}