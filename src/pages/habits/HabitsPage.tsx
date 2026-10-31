import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHabits } from '@/hooks/useHabits'
import { useHabitOverrides } from '@/hooks/useHabitOverrides'
import { useCreateHabit } from '@/hooks/useCreateHabit'
import { useUpdateHabit } from '@/hooks/useUpdateHabit'
import { useUpsertOverride } from '@/hooks/useUpsertOverride'
import { HabitForm } from './components/HabitForm'
import type { HabitFormValues } from './components/HabitForm'
import './HabitsPage.css'

export default function HabitsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const editId = searchParams.get('edit')
  const editDate = searchParams.get('date') ?? undefined

  const { habits } = useHabits()
  const { data: overridesList = [] } = useHabitOverrides(editDate ?? '')

  const { mutate: createHabit, isPending: creating } = useCreateHabit()
  const { mutate: updateHabit, isPending: updating } = useUpdateHabit()
  const { mutate: upsertOverride, isPending: upserting } = useUpsertOverride()

  const habitToEdit = editId ? habits.find(h => h.id === editId) : undefined
  const existingOverride = editDate
    ? overridesList.find(o => o.habitId === editId)
    : undefined

  const initialValues = habitToEdit
    ? {
        name: existingOverride?.name ?? habitToEdit.name,
        description: existingOverride?.description ?? habitToEdit.description,
        frequency: habitToEdit.frequency,
        time: existingOverride?.time ?? habitToEdit.time,
        duration: existingOverride?.duration ?? habitToEdit.duration,
      }
    : undefined

  function handleSubmit(data: HabitFormValues) {
    if (habitToEdit && editDate) {
      // Edição de ocorrência isolada → salva override
      upsertOverride(
        {
          habitId: habitToEdit.id,
          date: editDate,
          name: data.name,
          description: data.description,
          time: data.time,
          duration: data.duration,
        },
        { onSuccess: () => navigate(-1) },
      )
    } else if (habitToEdit) {
      // Edição de todos os eventos → atualiza o habit
      updateHabit(
        { habitId: habitToEdit.id, ...data },
        { onSuccess: () => navigate(-1) },
      )
    } else {
      // Criação
      createHabit(data, { onSuccess: () => navigate(-1) })
    }
  }

  function resolveTitle() {
    if (!habitToEdit) return t('habits.add')
    if (editDate) return t('habits.editDay')
    return t('habits.edit')
  }

  return (
    <div className="habits-page">
      <div className="habits-page__inner">
        <h1 className="habits-page__title">{resolveTitle()}</h1>

        <div className="habits-page__form-card">
          <HabitForm
            initialValues={initialValues}
            hideFrequency={!!editDate}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            loading={creating || updating || upserting}
          />
        </div>
      </div>
    </div>
  )
}
