import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HistoryPage from './HistoryPage'

describe('HistoryPage', () => {
  it('renders the History page', () => {
    render(<HistoryPage />)
    expect(screen.getByText('History')).toBeInTheDocument()
  })
})
