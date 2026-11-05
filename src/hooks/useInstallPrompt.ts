import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Lê o evento capturado pelo listener inline do index.html (roda antes do bundle)
let _deferredPrompt: BeforeInstallPromptEvent | null =
  (window as any).__installPromptEvent ?? null

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt)
  const [justInstalled, setJustInstalled] = useState(false)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      _deferredPrompt = evt
      ;(window as any).__installPromptEvent = evt
      setPrompt(evt)
    }

    function onAppInstalled() {
      _deferredPrompt = null
      setPrompt(null)
      setJustInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      _deferredPrompt = null
      setPrompt(null)
      setJustInstalled(true)
    }
  }

  // Avaliado a cada render: evita valor stale após refresh no browser
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  return {
    canInstall: !isStandalone && !justInstalled,
    hasPrompt: !!prompt,
    install,
  }
}
