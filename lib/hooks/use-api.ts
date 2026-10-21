import { useState, useCallback } from 'react'

/**
 * Generic API hook for making HTTP requests
 * Provides consistent loading, error, and data state management
 */
export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T = any>(
  apiFn: (...args: any[]) => Promise<Response>,
  options?: UseApiOptions<T>
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiFn(...args)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message || errorData.error || 'Request failed'
          throw new Error(errorMessage)
        }

        const result = await response.json()
        const responseData = result.data || result

        setData(responseData)
        options?.onSuccess?.(responseData)
        return responseData
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFn, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

/**
 * Convenience hook for GET requests
 */
export function useGet<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(
    () => fetch(url, { method: 'GET' }),
    options
  )
}

/**
 * Convenience hook for POST requests
 */
export function usePost<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(
    (body?: any) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      }),
    options
  )
}

/**
 * Convenience hook for PUT requests
 */
export function usePut<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(
    (body?: any) =>
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      }),
    options
  )
}

/**
 * Convenience hook for DELETE requests
 */
export function useDelete<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(
    () => fetch(url, { method: 'DELETE' }),
    options
  )
}
