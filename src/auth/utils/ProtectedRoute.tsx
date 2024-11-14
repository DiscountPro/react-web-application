import type { FC, PropsWithChildren } from 'react'
import useAuth from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
  const { isAuth } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" />
  }

  return children
}
