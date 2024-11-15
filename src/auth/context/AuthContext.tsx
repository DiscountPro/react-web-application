import useLocalStorage from '@app/shared/hooks/useLocalStorage'
import { createContext, FC, PropsWithChildren, useMemo } from 'react'
import { User } from '../model/user'
import { UserService } from '../services/userService'

const AuthContext = createContext<AuthContextProps | null>(null)

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null)

  const isAuth = useMemo(() => !!user, [user])

  const logout = function () {
    setUser(null)
  }

  const login = async function (username: string, password: string) {
    const response = await UserService.login(username, password)

    if (response.data.length) setUser(response.data[0])
    else throw new Error('Invalid username or password')
  }

  const register = async function (user: Omit<User, 'id'>) {
    const response = await UserService.register(user)

    if (response.status !== 201) throw new Error('Failed to create user')

    setUser(response.data)
  }

  return (
    <AuthContext.Provider value={{ user, isAuth, logout, register, login }}>
      {children}
    </AuthContext.Provider>
  )
}

interface AuthContextProps {
  user: User | null
  isAuth: boolean
  logout: () => void
  register: (user: Omit<User, 'id'>) => Promise<void>
  login: (username: string, password: string) => Promise<void>
}

export { AuthProvider, AuthContext }
