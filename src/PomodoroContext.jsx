import { useEffect, useRef, useState } from 'react'
import { PomodoroContext } from './usePomodoro'

function clampMinutes(value) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 1
  return Math.max(1, Math.min(90, parsed))
}

export function PomodoroProvider({ children }) {
  const intervalRef = useRef(null)
  const modeRef = useRef('focus')
  const focusDurationRef = useRef(25)
  const breakDurationRef = useRef(5)

  const [mode, setMode] = useState('focus')
  const [isActive, setIsActive] = useState(false)
  const [focusDuration, setFocusDurationState] = useState(25)
  const [breakDuration, setBreakDurationState] = useState(5)
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    focusDurationRef.current = focusDuration
  }, [focusDuration])

  useEffect(() => {
    breakDurationRef.current = breakDuration
  }, [breakDuration])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return () => {}
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) return prev - 1

        // Child resource cleanup first: stop active interval before parent mode/state transitions.
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsActive(false)

        if (modeRef.current === 'focus') {
          setCompletedFocusSessions((count) => count + 1)
          setMode('break')
          return breakDurationRef.current * 60
        }

        setMode('focus')
        return focusDurationRef.current * 60
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive])

  const setFocusDuration = (value) => {
    const next = clampMinutes(value)
    setFocusDurationState(next)
    if (!isActive && modeRef.current === 'focus') {
      setSecondsRemaining(next * 60)
    }
  }

  const setBreakDuration = (value) => {
    const next = clampMinutes(value)
    setBreakDurationState(next)
    if (!isActive && modeRef.current === 'break') {
      setSecondsRemaining(next * 60)
    }
  }

  const setTimerMode = (nextMode) => {
    if (nextMode !== 'focus' && nextMode !== 'break') return
    setMode(nextMode)
    setIsActive(false)
    setSecondsRemaining((nextMode === 'focus' ? focusDurationRef.current : breakDurationRef.current) * 60)
  }

  const toggleTimer = () => setIsActive((prev) => !prev)

  const resetTimer = () => {
    setIsActive(false)
    setSecondsRemaining((modeRef.current === 'focus' ? focusDurationRef.current : breakDurationRef.current) * 60)
  }

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const value = {
    mode,
    minutes,
    seconds,
    isActive,
    focusDuration,
    breakDuration,
    completedFocusSessions,
    setFocusDuration,
    setBreakDuration,
    setTimerMode,
    toggleTimer,
    resetTimer
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}
