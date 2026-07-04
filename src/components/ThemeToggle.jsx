import React from 'react'
import { useTheme } from '../context/ThemeContext'

// Small round button that flips between light and dark mode.
const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      type='button'
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label='Toggle theme'
      className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-lg transition-all ${className}`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
