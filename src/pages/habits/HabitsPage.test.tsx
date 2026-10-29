import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HabitsPage from './HabitsPage'

describe('HabitsPage', () => {
  it('renders the Habits page', () => {
    render(<HabitsPage />)
    expect(screen.getByText('Habits')).toBeInTheDocument()
  })
})
