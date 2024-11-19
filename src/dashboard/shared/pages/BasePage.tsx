import React, { FC } from 'react'

const BasePage: FC<BasePageProps> = ({ title, children }) => {
  return (
    <section>
      <header className="mb-4">
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>
      <div>{children}</div>
    </section>
  )
}

interface BasePageProps {
  title: string
  children?: React.ReactNode
}

export default BasePage
