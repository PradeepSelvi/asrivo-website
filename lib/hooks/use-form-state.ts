import { useState } from 'react'

/**
 * Form state management hook
 * Provides consistent state management for all forms
 */
export interface FormState {
  loading: boolean
  error: string | null
  success: boolean
  successMessage: string | null
}

export interface UseFormStateReturn extends FormState {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (message?: string) => void
  reset: () => void
  handleSubmit: <T>(
    submitFn: () => Promise<T>
  ) => Promise<{ data: T | null; error: string | null }>
}

export function useFormState(): UseFormStateReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const reset = () => {
    setLoading(false)
    setError(null)
    setSuccess(false)
    setSuccessMessage(null)
  }

  const setSuccessState = (message?: string) => {
    setSuccess(true)
    setSuccessMessage(message || null)
    setError(null)
    setLoading(false)
  }

  const handleSubmit = async <T,>(
    submitFn: () => Promise<T>
  ): Promise<{ data: T | null; error: string | null }> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const data = await submitFn()
      setSuccessState()
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setLoading(false)
      return { data: null, error: errorMessage }
    }
  }

  return {
    loading,
    error,
    success,
    successMessage,
    setLoading,
    setError,
    setSuccess: setSuccessState,
    reset,
    handleSubmit,
  }
}
