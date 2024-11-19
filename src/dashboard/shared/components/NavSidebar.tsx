import logo from '@app/assets/img/logo.png'
import useAuth from '@app/auth/hooks/useAuth'
import { Button } from 'primereact/button'

const NavSidebar = () => {
  const { logout, user } = useAuth()

  return (
    <div className="shrink-0 w-64 text-white bg-slate-800 flex flex-col">
      <header className="px-4 py-6">
        <img
          width={96}
          height={96}
          className="w-24 h-24 block mx-auto"
          src={logo}
          alt="DiscountPro Logo"
        />
        <h1 className="text-2xl text-center font-semibold mt-3">
          Discount PRO
        </h1>
      </header>
      <div className="h-full px-4 py-2">{'// TODO'}</div>
      <div className="px-4 py-6 flex items-center gap-2">
        <div className="w-full">
          <p className="text-xl font-bold">{user?.companyName}</p>
          <p className="text-lg">{user?.role}</p>
        </div>
        <Button
          icon="pi pi-sign-out"
          text
          className="text-white shrink-0"
          onClick={logout}
        />
      </div>
    </div>
  )
}

export default NavSidebar
