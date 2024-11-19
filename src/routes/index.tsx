import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import RootLayout from '../dashboard/shared/layout/RootLayout'
import LettersListPage from '@app/dashboard/letters/pages/LettersListPage'
import LetterService from '@app/dashboard/letters/services/letterService'
import type { Letter } from '@app/dashboard/letters/model/letter'
import LoginPage from '@app/auth/pages/LoginPage'
import SignUpPage from '@app/auth/pages/SignUpPage'
import { ProtectedRoute } from '@app/auth/utils/ProtectedRoute'
import ProfileService from '@app/dashboard/profile/services/profileService'

const letterService = new LetterService()
const profileService = new ProfileService()

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

            const profiles = await profileService.getAll()

            return { letters, profiles }
          }}
        />
        <Route path="*" element={<div>404</div>} />
      </Route>
    </>
  )
)

export default router
