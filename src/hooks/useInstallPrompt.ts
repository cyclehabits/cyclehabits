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

function isInstalledAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt)
  const [installed, setInstalled] = useState(isInstalledAsPWA)

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
      setInstalled(true)
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
      setInstalled(true)
    }
  }

  // Mostra botão se não está instalado como PWA
  // canInstall com prompt = instala direto; sem prompt = mostra instrução manual
  return {
    canInstall: !installed,
    hasPrompt: !!prompt,
    install,
  }
}
