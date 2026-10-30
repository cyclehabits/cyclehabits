import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHabits } from '@/hooks/useHabits'
import { useCreateHabit } from '@/hooks/useCreateHabit'
import { useUpdateHabit } from '@/hooks/useUpdateHabit'
import { HabitForm } from './components/HabitForm'
import type { HabitFormValues } from './components/HabitForm'
import './HabitsPage.css'

export default function HabitsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const editId = searchParams.get('edit')

  const { habits } = useHabits()
  const { mutate: createHabit, isPending: creating } = useCreateHabit()
  const { mutate: updateHabit, isPending: updating } = useUpdateHabit()

  const habitToEdit = editId ? habits.find(h => h.id === editId) : undefined

  const initialValues = habitToEdit
    ? {
        name: habitToEdit.name,
        description: habitToEdit.description,
        frequency: habitToEdit.frequency,
        time: habitToEdit.time,
        duration: habitToEdit.duration,
      }
    : undefined

  function handleSubmit(data: HabitFormValues) {
    if (habitToEdit) {
      updateHabit(
        { habitId: habitToEdit.id, ...data },
        { onSuccess: () => navigate(-1) },
      )
    } else {
      createHabit(data, { onSuccess: () => navigate(-1) })
    }
  }

  return (
    <div className="habits-page">
      <div className="habits-page__inner">
        <h1 className="habits-page__title">
          {habitToEdit ? t('habits.edit') : t('habits.add')}
        </h1>

        <div className="habits-page__form-card">
          <HabitForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            loading={creating || updating}
          />
        </div>
      </div>
    </div>
  )
}
