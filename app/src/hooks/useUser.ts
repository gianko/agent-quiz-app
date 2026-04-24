import { useState, useCallback } from 'react'
import { getUser, saveUser } from '@/lib/persistence'
import type { User } from '@/lib/persistence'

export function useUser() {
  const [user, setUser] = useState<User | null>(() => getUser())

  const setUsername = useCallback((username: string) => {
    saveUser(username)
    setUser({ username })
  }, [])

  return { user, setUsername }
}
