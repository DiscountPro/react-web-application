import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import RootLayout from '../shared/layout/RootLayout'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="example" element={<h1>Example page</h1>} />
    </Route>
  )
)

export default router
