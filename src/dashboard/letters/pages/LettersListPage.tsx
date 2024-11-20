import BasePage from '@app/dashboard/shared/pages/BasePage'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useLoaderData } from 'react-router-dom'
import {
  CreateLetterDto,
  InterestRateType,
  LetterCurrency,
  type Letter,
} from '../model/letter'
import { formatCurrency, formatDate } from '@app/shared/utils/format'
import { User, UserRole } from '@app/auth/model/user'
import useAuth from '@app/auth/hooks/useAuth'
import { Button } from 'primereact/button'
import { useEffect, useRef, useState } from 'react'
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
} from 'primereact/autocomplete'
import { Controller, useForm } from 'react-hook-form'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import LetterService from '../services/letterService'
import { Nullable } from 'primereact/ts-helpers'
import { Toast } from 'primereact/toast'
import DiscountLetterDialog from '../components/DiscountLetterDialog'

const defaultFormValues = {
  currency: LetterCurrency.SOLES,
  amount: 0,
  interestRate: 0,
  interestRateType: InterestRateType.EFFECTIVE,
  issueDate: null,
  expirationDate: null,
  interestRateFrequencyDays: 360,
  capitalizationDays: 90,
  initialExpense: 0,
  finalExpense: 0,
}

const CURRENCY_OPTIONS = [LetterCurrency.SOLES, LetterCurrency.DOLLARS]
const INTEREST_RATE_TYPE_OPTIONS = [
  InterestRateType.EFFECTIVE,
  InterestRateType.NOMINAL,
]

const letterService = new LetterService()

const LettersListPage = () => {
  const { user } = useAuth()
  const { letters, profiles } = useLoaderData() as {
    letters: Letter[]
    profiles: User[]
  }

  const [listData, setListData] = useState<
    Array<Letter & { clientName: string; client: Nullable<User> }>
  >([])

  const toast = useRef<Toast>(null)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: defaultFormValues,
  })

  const [client, setClient] = useState<Nullable<User>>(null)
  const [items, setItems] = useState<User[]>([])
  const [visible, setVisible] = useState(false)
  const [discountDialogVisible, setDiscountDialogVisible] = useState(false)
  const [discountLetter, setDiscountLetter] = useState<Nullable<Letter>>(null)

  useEffect(() => {
    const listData = letters.map((letter) => ({
      ...letter,
      clientName:
        profiles.find((profile) => profile.id === letter.clientId)
          ?.companyName ?? '',
      client:
        profiles.find((profile) => profile.id === letter.clientId) ?? null,
    }))

    setListData(listData)
  }, [letters, profiles])

  const letterAmountTemplate = (letter: Letter) => {
    return formatCurrency(letter.amount, {
      currency: letter.currency === LetterCurrency.DOLLARS ? 'USD' : 'PEN',
    })
  }

  const interestRateTemplate = (letter: Letter) => {
    if (letter.interestRateType === InterestRateType.NOMINAL)
      return `${letter.interestRate}% TN${letter.interestRateFrequencyDays}d (c.${letter.capitalizationDays}d)`

    return `${letter.interestRate}% TE${letter.interestRateFrequencyDays}d`
  }

  const issueDateTemplate = (letter: Letter) => formatDate(letter.issueDate)

  const expirationDateTemplate = (letter: Letter) =>
    formatDate(letter.expirationDate)

  const handleSearch = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase()

    const filteredItems = profiles.filter(
      (p) =>
        p.companyName.toLowerCase().includes(query) &&
        p.role === UserRole.CLIENT
    )

    if (filteredItems.length === 0) return setItems(filteredItems)

    setItems([...profiles.filter((p) => p.role === UserRole.CLIENT)])
  }

  const onCreateLetter = async (data: typeof defaultFormValues) => {
    if (!client) return

    try {
      const convertToCreateLetterDto = (data: typeof defaultFormValues) => {
        return {
          currency: data.currency,
          amount: data.amount,
          issueDate: (data.issueDate as unknown as Date).toISOString(),
          expirationDate: (
            data.expirationDate as unknown as Date
          ).toISOString(),
          interestRate: data.interestRate,
          interestRateType: data.interestRateType,
          capitalizationDays: data.capitalizationDays,
          clientId: client.id,
          ownerId: user!.id,
          interestRateFrequencyDays: data.interestRateFrequencyDays,
          expenses: {
            initialExpenses: data.initialExpense,
            finalExpenses: data.finalExpense,
          },
          isDiscounted: false,
        } satisfies CreateLetterDto
      }

      const createLetterDto: CreateLetterDto = convertToCreateLetterDto(data)

      const newData = await letterService.create<CreateLetterDto, Letter>(
        createLetterDto
      )

      setListData((prev) => [
        ...prev,
        { ...newData, clientName: client.companyName, client: client },
      ])
      setVisible(false)
      reset()
      setClient(null)
      toast.current?.show({
        severity: 'success',
        summary: 'Registro completo',
        detail: 'Se registro la letra con éxito.',
        life: 3000,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // const onDeleteLetter = async (id: number) => {
  //   try {
  //     await letterService.delete(id)
  //     setListData((prev) => prev.filter((letter) => letter.id !== id))
  //     toast.current?.show({
  //       severity: 'success',
  //       summary: 'Eliminación completo',
  //       detail: 'Se elimino la letra con éxito.',
  //       life: 2000,
  //     })
  //   } catch {
  //     toast.current?.show({
  //       severity: 'error',
  //       summary: 'Error al eliminar',
  //       detail: 'Ocurrió un error al eliminar la letra.',
  //       life: 2000,
  //     })
  //   }
  // }

  return (
    <BasePage title="Reporte de letras/facturas registradas">
      <header className="flex justify-end mb-6">
        <Button
          label="Registrar letra"
          raised
          icon="pi pi-plus"
          iconPos="right"
          onClick={() => setVisible(true)}
        />
      </header>

      <DataTable value={listData} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="#"></Column>
        <Column field="clientName" header="Cliente"></Column>
        <Column
          field="amount"
          header="Monto de letra"
          body={letterAmountTemplate}
        ></Column>
        <Column
          field="interestRate"
          header="Tasa de interés"
          body={interestRateTemplate}
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
        <Column
          header="Acciones"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body={(letter: any) => {
            const role = user?.role

            if (role === UserRole.CREDITOR) {
              return (
                <div className="flex justify-center gap-x-2">
                  <Button label="Ver" size="small" raised />
                  {!letter?.isDiscounted && (
                    <Button
                      label="Descontar"
                      raised
                      size="small"
                      severity="secondary"
                      onClick={() => {
                        setDiscountLetter(letter)
                        setDiscountDialogVisible(true)
                        setClient(letter.client)
                      }}
                    />
                  )}

                  {/* <Button
                    label="Eliminar"
                    size="small"
                    raised
                    severity="danger"
                    onClick={() => onDeleteLetter(letter.id)}
                  /> */}
                </div>
              )
            }
            return <p>No hay acciones disponibles.</p>
          }}
        ></Column>
      </DataTable>

      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        className="max-w-lg w-full"
        // pt={{ message: { className: 'w-full m-0' } }}
        header="Registrar letra/factura"
      >
        <form
          className="w-full flex flex-col gap-5"
          onSubmit={handleSubmit(onCreateLetter)}
        >
          <AutoComplete
            className="w-full"
            field="companyName"
            placeholder="Buscar empresa a la que se le emitirá la letra/factura"
            suggestions={items}
            completeMethod={handleSearch}
            value={client}
            onChange={(e) => setClient(e.value)}
            dropdown
          />
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="currency" className="text-sm">
                Tipo de moneda
              </label>
              <Controller
                control={control}
                name="currency"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <Dropdown
                    className="w-full"
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={CURRENCY_OPTIONS}
                    optionLabel="currency"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="interestRateType" className="text-sm">
                Tipo de tasa
              </label>
              <Controller
                control={control}
                name="interestRateType"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <Dropdown
                    className="w-full"
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={INTEREST_RATE_TYPE_OPTIONS}
                    optionLabel="interestRateType"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="currency" className="text-sm">
                Monto de letra
              </label>
              <Controller
                control={control}
                name="amount"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field, fieldState }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="amount-error"
                    invalid={fieldState.invalid}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="interestRateType" className="text-sm">
                Tasa de interés
              </label>
              <Controller
                control={control}
                name="interestRate"
                rules={{
                  required: 'Este campo es requerido.',
                  min: 0,
                  max: 100,
                }}
                render={({ field }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    suffix="%"
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="amount-error"
                    min={0}
                    max={100}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="currency" className="text-sm">
                Fecha de emisión
              </label>
              <Controller
                control={control}
                name="issueDate"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <Calendar
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    dateFormat="dd/mm/yy"
                    mask="99/99/9999"
                    showIcon
                    icon="pi pi-calendar"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="interestRateFrequencyDays" className="text-sm">
                Tiempo exp. de tasa (exp. en días)
              </label>
              <Controller
                control={control}
                name="interestRateFrequencyDays"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="interestRateFrequencyDays-error"
                    min={0}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="currency" className="text-sm">
                Fecha de vencimiento
              </label>
              <Controller
                control={control}
                name="expirationDate"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <Calendar
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    dateFormat="dd/mm/yy"
                    mask="99/99/9999"
                    icon="pi pi-calendar"
                    showIcon
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="interestRateFrequencyDays" className="text-sm">
                Capitalización (exp. en días)
              </label>
              <Controller
                control={control}
                name="capitalizationDays"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="interestRateFrequencyDays-error"
                    min={0}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="currency" className="text-sm">
                Gastos iniciales
              </label>
              <Controller
                control={control}
                name="initialExpense"
                render={({ field }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="initialExpense-error"
                    min={0}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="interestRateFrequencyDays" className="text-sm">
                Gastos finales
              </label>
              <Controller
                control={control}
                name="finalExpense"
                render={({ field }) => (
                  <InputNumber
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    aria-errormessage="finalExpense-error"
                    min={0}
                  />
                )}
              />
            </div>
          </div>

          <Button label="Registrar letra" />
        </form>
      </Dialog>
      <DiscountLetterDialog
        visible={discountDialogVisible}
        onHide={() => setDiscountDialogVisible(false)}
        letter={discountLetter}
        banks={profiles.filter((p) => p.role === UserRole.BANK)}
        client={client}
        onDiscount={(letter) => {
          setListData((prev) =>
            prev.map((l) =>
              l.id === letter.id ? { ...l, isDiscounted: true } : l
            )
          )
          setDiscountDialogVisible(false)
          setDiscountLetter(null)
          setClient(null)
          toast.current?.show({
            severity: 'success',
            summary: 'Descuento completo',
            detail: 'Se descontó la letra con éxito.',
            life: 3000,
          })
        }}
      />
      <Toast ref={toast} position="bottom-right" />
    </BasePage>
  )
}

export default LettersListPage
