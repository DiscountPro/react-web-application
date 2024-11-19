import { FC, PropsWithChildren } from 'react'

const SummaryStat: FC<SummaryStatProps> = ({ title, children, className }) => {
  return (
    <article
      className={`border border-gray-600 p-4 rounded-md flex flex-col ${
        className ?? ''
      }`}
    >
      <header>
        <h6 className="text-sm font-bold">{title}</h6>
      </header>
      <div className="mt-2 h-full">{children}</div>
    </article>
  )
}

interface SummaryStatProps extends PropsWithChildren {
  title: string
  className?: string
}

export default SummaryStat
