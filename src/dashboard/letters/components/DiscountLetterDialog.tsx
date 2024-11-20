import { Dialog } from 'primereact/dialog'
import { InterestRateType, Letter, LetterCurrency } from '../model/letter'
import { FC, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
} from 'primereact/autocomplete'
import { User, UserRole } from '@app/auth/model/user'
import { Nullable } from 'primereact/ts-helpers'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { formatCurrency, formatDate } from '@app/shared/utils/format'
import { Button } from 'primereact/button'
import DiscountLettersService from '@app/dashboard/discount-letters/services/DiscountLettersService'
import { CreateDiscountLetterDto } from '@app/dashboard/discount-letters/discountLetter'
import LetterService from '../services/letterService'

const defaultFormValues = {
  discountDate: null,
}

const discountLettersService = new DiscountLettersService()
const letterService = new LetterService()

const DiscountLetterDialog: FC<DiscountLetterDialogProps> = ({
  banks,
  visible,
  letter,
  onHide,
  onDiscount,
}) => {
  const [bank, setBank] = useState<Nullable<User>>(null)
  const [banksOptions, setBanksOptions] = useState<User[]>([])
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: defaultFormValues,
  })

  const discountDate = watch('discountDate') as Nullable<Date>

  const discountOffDays = useMemo(() => {
    if (!discountDate || !letter?.expirationDate) return 0

    const timeDiff =
      new Date(letter.expirationDate).getTime() -
      new Date(discountDate).getTime()

    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }, [discountDate, letter?.expirationDate])

  const getTEP = (letter: Letter, days: number) => {
    if (letter.interestRateType === InterestRateType.NOMINAL) {
      const tep =
        (1 +
          letter.interestRate /
            100 /
            (letter.interestRateFrequencyDays / letter.capitalizationDays!)) **
          (days / letter.capitalizationDays!) -
        1

      return tep
    }

    const tep =
      (1 + letter.interestRate / 100) **
        (days / letter.interestRateFrequencyDays) -
      1
    return tep
  }

  const discountPercentage = useMemo(() => {
    if (!discountOffDays || !letter) return 0

    const tep = getTEP(letter, discountOffDays)
    const discountRate = tep / (1 + tep)

    return discountRate * 100
  }, [discountOffDays, letter])

  const handleSearch = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase()

    const filteredBanks = banks.filter(
      (p) =>
        p.companyName.toLowerCase().includes(query) && p.role === UserRole.BANK
    )

    if (filteredBanks.length === 0) return setBanksOptions(filteredBanks)

    setBanksOptions([...banks])
  }

  const interestRateTemplate = (letter: Letter) => {
    if (letter.interestRateType === InterestRateType.NOMINAL)
      return `${letter.interestRate}% TN${letter.interestRateFrequencyDays}d (c.${letter.capitalizationDays}d)`

    return `${letter.interestRate}% TE${letter.interestRateFrequencyDays}d`
  }

  const onDiscountLetter = async (data: typeof defaultFormValues) => {
    if (!letter || !bank) return

    try {
      await discountLettersService.create<CreateDiscountLetterDto>({
        bankId: bank.id,
        clientId: letter.clientId,
        creditorId: letter.ownerId,
        discountDate: data.discountDate!,
        letterId: letter.id,
        discountPercentage,
      })
      await letterService.discountLetter(letter.id)
      onDiscount(letter)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog
      header="Descuenta la letra"
      visible={visible}
      onHide={() => {
        reset()
        onHide()
      }}
    >
      <header>
        <p className="text-sm leading-8">
          Descuenta la letra a un banco para que se encargue de cobrarla.
        </p>

        <p className="text-sm leading-8">
          <span className="font-semibold">Letra por</span>{' '}
          {formatCurrency(letter?.amount ?? 0, {
            currency:
              letter?.currency === LetterCurrency.DOLLARS ? 'USD' : 'PEN',
          })}
        </p>

        <p className="text-sm leading-8">
          <span className="font-semibold">Fecha de emisión:</span>{' '}
          {letter?.issueDate && formatDate(letter!.issueDate)}
        </p>
        <p className="text-sm leading-8">
          <span className="font-semibold">Fecha de vencimiento:</span>{' '}
          {letter?.expirationDate && formatDate(letter!.expirationDate)}
        </p>
        <p className="text-sm leading-8">
          <span className="font-semibold">Tasa de interés:</span>{' '}
          {letter && interestRateTemplate(letter)}
        </p>
      </header>
      <form
        className="w-full flex flex-col gap-5 mt-4"
        onSubmit={handleSubmit(onDiscountLetter)}
      >
        <AutoComplete
          className="w-full"
          field="companyName"
          placeholder="Buscar banco que desea tercerizar la letra"
          suggestions={banksOptions}
          completeMethod={handleSearch}
          value={bank}
          onChange={(e) => setBank(e.value)}
          dropdown
        />

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="currency" className="text-sm">
              Fecha de descuento
            </label>
            <Controller
              control={control}
              name="discountDate"
              rules={{ required: 'Este campo es requerido.' }}
              render={({ field }) => (
                <Calendar
                  id={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="dd/mm/yy"
                  mask="99/99/9999"
                  minDate={new Date(letter?.issueDate ?? new Date())}
                  maxDate={new Date(letter?.expirationDate ?? new Date())}
                  showIcon
                  icon="pi pi-calendar"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="currency" className="text-sm">
              Tasa de descuento (%)
            </label>
            <InputNumber value={discountPercentage} suffix="%" disabled />
          </div>
        </div>
        <Button label="Descontar" />
      </form>
    </Dialog>
  )
}

interface DiscountLetterDialogProps {
  visible: boolean
  banks: User[]
  client: Nullable<User>
  onHide: () => void
  letter: Nullable<Letter>
  onDiscount: (letter: Letter) => void
}

export default DiscountLetterDialog
