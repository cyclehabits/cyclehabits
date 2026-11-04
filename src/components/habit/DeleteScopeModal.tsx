import { useTranslation } from 'react-i18next'
import { Dialog } from '@awakr/awake-ui/dialog'
import { Button } from '@awakr/awake-ui/button'
import './EditScopeModal.css'

interface DeleteScopeModalProps {
  open: boolean
  onThisDay: () => void
  onAllEvents: () => void
  onClose: () => void
}

export function DeleteScopeModal({ open, onThisDay, onAllEvents, onClose }: DeleteScopeModalProps) {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="edit-scope-backdrop" />
        <Dialog.Popup className="edit-scope-modal">
          <p className="edit-scope-modal__title">{t('habits.deleteScope.title')}</p>
          <div className="edit-scope-modal__actions">
            <Button variant="destructive" className="edit-scope-modal__option" onClick={onThisDay}>
              {t('habits.deleteScope.thisDay')}
            </Button>
            <Button variant="destructive" className="edit-scope-modal__option" onClick={onAllEvents}>
              {t('habits.deleteScope.allEvents')}
            </Button>
          </div>
          <Button variant="ghost" className="edit-scope-modal__cancel" onClick={onClose}>
            {t('habits.form.cancel')}
          </Button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
