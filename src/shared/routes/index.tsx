import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import RootLayout from '../layout/RootLayout'
import LettersListPage from '@app/letters/pages/LettersListPage'
import LetterService from '@app/letters/services/letterService'
import type { Letter } from '@app/letters/model/letter'
import LoginPage from '@app/auth/pages/LoginPage'
import SignUpPage from '@app/auth/pages/SignUpPage'
import { ProtectedRoute } from '@app/auth/utils/ProtectedRoute'

const letterService = new LetterService()

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="letters"
          element={<LettersListPage />}
          loader={async ({ request }) => {
            const letters = await letterService.getAll<Letter>({
              signal: request.signal,
            })
            return letters
          }}
        />
        <Route path="*" element={<div>404</div>} />
      </Route>
    </>
  )
)

export default router
