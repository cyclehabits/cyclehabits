import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Captura global antes do React montar
let _deferredPrompt: BeforeInstallPromptEvent | null = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferredPrompt = e as BeforeInstallPromptEvent
})

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      _deferredPrompt = evt
      setPrompt(evt)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      _deferredPrompt = null
      setPrompt(null)
    }
  }

  return { canInstall: !!prompt, install }
}
