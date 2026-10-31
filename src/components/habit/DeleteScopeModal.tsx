import { useTranslation } from 'react-i18next'
import './EditScopeModal.css'

interface DeleteScopeModalProps {
  onThisDay: () => void
  onAllEvents: () => void
  onClose: () => void
}

export function DeleteScopeModal({ onThisDay, onAllEvents, onClose }: DeleteScopeModalProps) {
  const { t } = useTranslation()

  return (
    <div className="edit-scope-overlay" onClick={onClose}>
      <div className="edit-scope-modal" onClick={e => e.stopPropagation()}>
        <p className="edit-scope-modal__title">{t('habits.deleteScope.title')}</p>
        <div className="edit-scope-modal__actions">
          <button className="edit-scope-modal__option edit-scope-modal__option--danger" onClick={onThisDay}>
            {t('habits.deleteScope.thisDay')}
          </button>
          <button className="edit-scope-modal__option edit-scope-modal__option--danger" onClick={onAllEvents}>
            {t('habits.deleteScope.allEvents')}
          </button>
        </div>
        <button className="edit-scope-modal__cancel" onClick={onClose}>
          {t('habits.form.cancel')}
        </button>
      </div>
    </div>
  )
}
