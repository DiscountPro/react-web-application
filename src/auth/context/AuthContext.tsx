import useLocalStorage from '@app/shared/hooks/useLocalStorage'
import { createContext, FC, PropsWithChildren, useMemo } from 'react'
import { User } from '../model/user'

const AuthContext = createContext<AuthContextProps | null>(null)

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null)

  const isAuth = useMemo(() => !!user, [user])

  const logout = function () {
    setUser(null)
  }

  const login = function () {}

  return (
    <AuthContext.Provider value={{ user, isAuth, logout, login }}>
      {children}
    </AuthContext.Provider>
  )
}

interface AuthContextProps {
  user: User | null
  isAuth: boolean
  logout: () => void
  login: () => void
}

export { AuthProvider, AuthContext }
