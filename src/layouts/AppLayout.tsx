import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/theme/useTheme'
import { Button } from '@awakr/awake-ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || !isMobile) return null

  async function handleInstall() {
    await deferredPrompt!.prompt()
    const { outcome } = await deferredPrompt!.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1rem', zIndex: 50 }}>
      <Button variant="primary" size="sm" onClick={handleInstall}>
        ⬇ Instalar app
      </Button>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50 }}>
      <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Alternar tema">
        {theme === 'dark' ? '☀️' : '🌙'}
      </Button>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      <InstallButton />
      {children}
    </>
  )
}