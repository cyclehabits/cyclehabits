import { useTranslation } from 'react-i18next'
import './EditScopeModal.css'

interface EditScopeModalProps {
  onThisDay: () => void
  onAllEvents: () => void
  onClose: () => void
}

export function EditScopeModal({ onThisDay, onAllEvents, onClose }: EditScopeModalProps) {
  const { t } = useTranslation()

  return (
    <div className="edit-scope-overlay" onClick={onClose}>
      <div className="edit-scope-modal" onClick={e => e.stopPropagation()}>
        <p className="edit-scope-modal__title">{t('habits.editScope.title')}</p>
        <div className="edit-scope-modal__actions">
          <button className="edit-scope-modal__option" onClick={onThisDay}>
            {t('habits.editScope.thisDay')}
          </button>
          <button className="edit-scope-modal__option" onClick={onAllEvents}>
            {t('habits.editScope.allEvents')}
          </button>
        </div>
        <button className="edit-scope-modal__cancel" onClick={onClose}>
          {t('habits.form.cancel')}
        </button>
      </div>
    </div>
  )
}
