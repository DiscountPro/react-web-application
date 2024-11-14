import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import RootLayout from '../layout/RootLayout'
import LettersListPage from '@app/letters/pages/LettersListPage'
import LetterService from '@app/letters/services/letterService'
import type { Letter } from '@app/letters/model/letter'

const letterService = new LetterService()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
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
  )
)

export default router
