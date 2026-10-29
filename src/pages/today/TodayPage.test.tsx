import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TodayPage from './TodayPage'

describe('TodayPage', () => {
  it('renders the Today page', () => {
    render(<TodayPage />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
