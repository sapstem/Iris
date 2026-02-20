import { createContext, useContext } from 'react'

export const PomodoroContext = createContext(null)

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error('usePomodoro must be used inside PomodoroProvider')
  }
  return context
}
