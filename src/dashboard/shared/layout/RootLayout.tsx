import { Outlet } from 'react-router-dom'
import NavSidebar from '../components/NavSidebar'

const RootLayout = () => {
  return (
    <section className="h-screen w-full flex">
      <NavSidebar />
      <main className="w-full px-8 py-10 flex flex-col overflow-auto max-w-7xl mx-auto">
        <Outlet />
      </main>
    </section>
  )
}

export default RootLayout
