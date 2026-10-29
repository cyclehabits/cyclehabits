import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SettingsPage from './SettingsPage'

describe('SettingsPage', () => {
  it('renders the Settings page', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
