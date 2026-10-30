import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Captura o evento antes do React montar (ele dispara cedo demais para o useEffect)
let _deferredPrompt: BeforeInstallPromptEvent | null = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferredPrompt = e as BeforeInstallPromptEvent
})

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt)
  const [justInstalled, setJustInstalled] = useState(false)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      _deferredPrompt = evt
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
