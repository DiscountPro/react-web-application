import BasePage from '@shared/pages/BasePage'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useLoaderData } from 'react-router-dom'
import { LetterCurrency, type Letter } from '../model/letter'
import { formatCurrency, formatDate } from '@app/shared/utils/format'

const LettersListPage = () => {
  const letters = useLoaderData() as Letter[]

  const letterAmountTemplate = (letter: Letter) => {
    return formatCurrency(letter.amount, {
      currency: letter.currency === LetterCurrency.DOLLARS ? 'USD' : 'PEN',
    })
  }

  const issueDateTemplate = (letter: Letter) => formatDate(letter.issueDate)

  const expirationDateTemplate = (letter: Letter) =>
    formatDate(letter.expirationDate)

  return (
    <BasePage title="Listado de letras">
      <DataTable value={letters} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID"></Column>
        <Column
          field="amount"
          header="Name"
          body={letterAmountTemplate}
        ></Column>
        <Column
          field="issueDate"
          header="Fecha de emisión"
          body={issueDateTemplate}
        ></Column>
        <Column
          field="quantity"
          header="Fecha de vencimiento"
          body={expirationDateTemplate}
        ></Column>
        <Column field="interestRateType" header="Tipo de interés"></Column>
        <Column field="interestRate" header="Tasa de interés"></Column>
      </DataTable>
    </BasePage>
  )
}

export default LettersListPage
