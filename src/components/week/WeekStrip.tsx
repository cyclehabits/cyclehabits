import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
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

function getWeekLabel(days: Date[]): string {
  const wednesday = days[3]
  return `${MONTHS[wednesday.getMonth()]} ${wednesday.getFullYear()}`
}

const WEEKS_BACK = 12
const WEEKS_FORWARD = 26

export function WeekStrip({ selected, onChange }: WeekStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  const todayStr = toLocalDateStr(today)
  const selectedStr = toLocalDateStr(selected)

  // Desktop: offset relativo à semana atual (0 = semana atual)
  const [weekOffset, setWeekOffset] = useState<number>(() => {
    const currentWeekStart = getWeekStart(today)
    const selectedWeekStart = getWeekStart(selected)
    const diff = Math.round(
      (selectedWeekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
    return Math.max(-WEEKS_BACK, Math.min(WEEKS_FORWARD, diff))
  })

  const [isDesktop, setIsDesktop] = useState<boolean>(
    () => window.matchMedia('(min-width: 1024px)').matches
  )

  const [visibleMonth, setVisibleMonth] = useState<string>(() => {
    return `${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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

  // Semana exibida no desktop
  const desktopWeekIndex = WEEKS_BACK + weekOffset
  const desktopDays = weeks[desktopWeekIndex]

  // Atualiza o mês visível no desktop ao mudar offset
  useEffect(() => {
    if (isDesktop) {
      setVisibleMonth(getWeekLabel(desktopDays))
    }
  }, [isDesktop, weekOffset, desktopDays])

  const handlePrev = useCallback(() => {
    setWeekOffset(o => Math.max(-WEEKS_BACK, o - 1))
  }, [])

  const handleNext = useCallback(() => {
    setWeekOffset(o => Math.min(WEEKS_FORWARD, o + 1))
  }, [])

  // Mobile: scroll para a semana do selected na montagem
  useEffect(() => {
    if (isDesktop) return
    const el = scrollRef.current
    if (!el) return
    const selectedWeekStart = toLocalDateStr(getWeekStart(selected))
    const weekEls = el.querySelectorAll<HTMLElement>('[data-week-start]')
    weekEls.forEach(weekEl => {
      if (weekEl.dataset.weekStart === selectedWeekStart) {
        weekEl.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
      }
    })
  }, [isDesktop])

  // Mobile: IntersectionObserver para detectar semana visível
  useEffect(() => {
    if (isDesktop) return
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
  }, [isDesktop])

  const renderDay = (day: Date) => {
    const str = toLocalDateStr(day)
    const isToday = str === todayStr
    const isSelected = str === selectedStr

    return (
      <button
        key={str}
        className={`week-strip__day${isToday ? ' week-strip__day--today' : ''}${isSelected ? ' week-strip__day--selected' : ''}`}
        onClick={() => onChange(day)}
      >
        <span className="week-strip__label">{DAYS_SHORT[day.getDay()]}</span>
        <span className="week-strip__num">{day.getDate()}</span>
      </button>
    )
  }

  return (
    <div className="week-strip-wrapper">
      <div className="week-strip-header">
        <span className="week-strip-month">{visibleMonth}</span>
        <div className="week-strip-arrows">
          <button
            className="week-strip-arrow"
            onClick={handlePrev}
            disabled={weekOffset <= -WEEKS_BACK}
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <button
            className="week-strip-arrow"
            onClick={handleNext}
            disabled={weekOffset >= WEEKS_FORWARD}
            aria-label="Próxima semana"
          >
            ›
          </button>
        </div>
      </div>

      {/* Desktop: grid fixo da semana atual */}
      <div className="week-strip week-strip--desktop">
        {desktopDays.map(renderDay)}
      </div>

      {/* Mobile: scroll horizontal entre semanas */}
      <div className="week-strip-scroll" ref={scrollRef}>
        {weeks.map((days) => {
          const weekStart = toLocalDateStr(days[0])
          return (
            <div key={weekStart} className="week-strip" data-week-start={weekStart}>
              {days.map(renderDay)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
