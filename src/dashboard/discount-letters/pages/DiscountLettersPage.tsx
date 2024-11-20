import BasePage from '@app/dashboard/shared/pages/BasePage'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import SummaryStat from '../components/SummaryStat'
import { useLoaderData } from 'react-router'
import { DiscountLetter } from '../discountLetter'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatCurrency, formatDate } from '@app/shared/utils/format'
import {
  InterestRateType,
  LetterCurrency,
} from '@app/dashboard/letters/model/letter'

const exchangeRate = 3.79368

const DiscountLettersPage = () => {
  const [startDate, setStartDate] = useState<Nullable<Date>>(null)
  const [endDate, setEndDate] = useState<Nullable<Date>>(null)
  const initialData = useLoaderData() as DiscountLetter[]

  const [data, setData] = useState<DiscountLetter[]>(initialData)

  useEffect(() => {
    if (startDate && endDate) {
      setData(
        initialData.filter(
          (d) =>
            new Date(d.discountDate) >= startDate &&
            new Date(d.discountDate) <= endDate
        )
      )
    } else {
      setData(initialData)
    }
  }, [startDate, endDate, initialData])

  const getNominalValue = (d: DiscountLetter) => {
    const {
      amount,
      interestRate,
      interestRateType,
      expirationDate,
      issueDate,
      interestRateFrequencyDays,
      capitalizationDays,
    } = d.letter

    const offDays =
      (new Date(expirationDate).getTime() - new Date(issueDate).getTime()) /
      (1000 * 60 * 60 * 24)

    let result = amount

    if (interestRateType === InterestRateType.EFFECTIVE) {
      result =
        amount *
        (1 + interestRate / 100) ** (offDays / interestRateFrequencyDays)
    } else if (interestRateType === InterestRateType.NOMINAL) {
      result =
        amount *
        (1 + interestRate / 100 / interestRateFrequencyDays) **
          capitalizationDays!
    }

    console.log(result)

    return result
  }

  const getNetoValue = useCallback(
    (d: DiscountLetter) =>
      getNominalValue(d) * (1 - d.discountPercentage / 100),
    []
  )

  const getReceivedValue = useCallback(
    (d: DiscountLetter) => getNetoValue(d) - d.letter.expenses.initialExpenses,
    [getNetoValue]
  )

  const getPayValue = useCallback(
    (d: DiscountLetter) => getNetoValue(d) + d.letter.expenses.finalExpenses,
    [getNetoValue]
  )

  const getTCEA = useCallback(
    (d: DiscountLetter) => {
      const offDays =
        (new Date(d.letter.expirationDate).getTime() -
          new Date(d.discountDate).getTime()) /
        (1000 * 60 * 60 * 24)

      return (getPayValue(d) / getReceivedValue(d)) ** (360 / offDays) - 1
    },
    [getPayValue, getReceivedValue]
  )

  const countLetters = useMemo(
    () =>
      data.reduce(
        (acc, d) => {
          if (d.letter.currency === LetterCurrency.SOLES) {
            acc.soles += 1
          } else {
            acc.dollars += 1
          }
          return acc
        },
        { soles: 0, dollars: 0 }
      ),
    [data]
  )

  const totalPayValue = useMemo(() => {
    const total = data.reduce(
      (acc, d) => {
        const payValue = getPayValue(d)
        if (d.letter.currency === LetterCurrency.SOLES) {
          acc.soles += payValue
        } else {
          acc.dollars += payValue
        }
        return acc
      },
      { soles: 0, dollars: 0 }
    )
    return {
      soles: total.soles,
      dollars: total.dollars,
    }
  }, [data, getPayValue])

  const totalReceivedValue = useMemo(() => {
    const total = data.reduce(
      (acc, d) => {
        const receivedValue = getReceivedValue(d)
        if (d.letter.currency === LetterCurrency.SOLES) {
          acc.soles += receivedValue
        } else {
          acc.dollars += receivedValue
        }
        return acc
      },
      { soles: 0, dollars: 0 }
    )
    return {
      soles: total.soles,
      dollars: total.dollars,
    }
  }, [data, getReceivedValue])

  const avgTCEA = useMemo(() => {
    const total = data.reduce(
      (acc, d) => {
        const tcea = getTCEA(d)
        if (d.letter.currency === LetterCurrency.SOLES) {
          acc.soles += tcea
        } else {
          acc.dollars += tcea
        }
        return acc
      },
      { soles: 0, dollars: 0 }
    )

    return {
      soles: total.soles / countLetters.soles,
      dollars: total.dollars / countLetters.dollars,
    }
  }, [countLetters.dollars, countLetters.soles, data, getTCEA])

  return (
    <BasePage title="Reporte de descuento de letras/facturas">
      <header>
        <h4 className="text-lg font-bold">Descuento de letras realizados</h4>

        <div className="flex justify-between">
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center">
              <label htmlFor="" className="w-16">
                Desde:
              </label>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                showIcon
                icon="pi pi-calendar"
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="" className="w-16">
                Hasta:
              </label>
              <Calendar
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                showIcon
                icon="pi pi-calendar"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            <SummaryStat
              title="Estadísticas valor entregado"
              className="shrink-0"
            >
              {(() => {
                const soles = totalPayValue.soles / countLetters.soles
                const dollars = totalPayValue.dollars / countLetters.dollars

                return (
                  <>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Promedio en soles: </span>
                      <span>
                        {formatCurrency(Number.isNaN(soles) ? 0 : soles, {
                          currency: 'PEN',
                        })}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">
                        Promedio en dolares:{' '}
                      </span>
                      <span>
                        {formatCurrency(Number.isNaN(dollars) ? 0 : dollars, {
                          currency: 'USD',
                        })}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Total (soles): </span>
                      <span>
                        {formatCurrency(
                          Number.isNaN(soles + dollars * exchangeRate)
                            ? 0
                            : soles + dollars * exchangeRate,
                          {
                            currency: 'PEN',
                          }
                        )}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Total (dolares): </span>
                      <span>
                        {formatCurrency(
                          Number.isNaN(dollars + soles / exchangeRate)
                            ? 0
                            : dollars + soles / exchangeRate,
                          {
                            currency: 'USD',
                          }
                        )}
                      </span>
                    </p>
                  </>
                )
              })()}
            </SummaryStat>
            <SummaryStat
              title="Estadísticas de valor recibido"
              className="shrink-0"
            >
              {(() => {
                const soles = totalReceivedValue.soles / countLetters.soles
                const dollars =
                  totalReceivedValue.dollars / countLetters.dollars

                return (
                  <>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Promedio en soles: </span>
                      <span>
                        {formatCurrency(Number.isNaN(soles) ? 0 : soles, {
                          currency: 'PEN',
                        })}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">
                        Promedio en dolares:{' '}
                      </span>
                      <span>
                        {formatCurrency(Number.isNaN(dollars) ? 0 : dollars, {
                          currency: 'USD',
                        })}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Total (soles): </span>
                      <span>
                        {formatCurrency(
                          Number.isNaN(soles + dollars * exchangeRate)
                            ? 0
                            : soles + dollars * exchangeRate,
                          {
                            currency: 'PEN',
                          }
                        )}
                      </span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Total (dolares): </span>
                      <span>
                        {formatCurrency(
                          Number.isNaN(dollars + soles / exchangeRate)
                            ? 0
                            : dollars + soles / exchangeRate,
                          {
                            currency: 'USD',
                          }
                        )}
                      </span>
                    </p>
                  </>
                )
              })()}
            </SummaryStat>
            <SummaryStat title="Estadísticas de TCEA " className="shrink-0">
              {(() => {
                const avgSoles = +(avgTCEA.soles * 100).toFixed(7)
                const avgDollars = +(avgTCEA.dollars * 100).toFixed(7)

                return (
                  <>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">Promedio en soles: </span>
                      <span>{Number.isNaN(avgSoles) ? 0 : avgSoles}%</span>
                    </p>
                    <p className="text-sm leading-8">
                      <span className="font-semibold">En dolares: </span>
                      <span>{Number.isNaN(avgDollars) ? 0 : avgDollars}%</span>
                    </p>
                  </>
                )
              })()}
            </SummaryStat>
          </div>
        </div>
      </header>

      <div className="mt-8">
        <DataTable value={data} size="small" scrollable>
          <Column field="id" header="#" />
          <Column
            style={{ minWidth: '150px' }}
            body={(d: DiscountLetter) => d.bank.companyName}
            header="Tercero"
          />
          <Column
            header="Monto de letra"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              formatCurrency(d.letter.amount, {
                currency:
                  d.letter.currency === LetterCurrency.SOLES ? 'PEN' : 'USD',
              })
            }
          />

          <Column
            header="Tasa de descuento"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              `${+d.discountPercentage.toFixed(7)} %`
            }
          />

          <Column
            header="Valor nominal"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              formatCurrency(getNominalValue(d), {
                currency:
                  d.letter.currency === LetterCurrency.SOLES ? 'PEN' : 'USD',
              })
            }
          />
          <Column
            header="Descuento"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              formatCurrency(
                (getNominalValue(d) * d.discountPercentage) / 100,
                {
                  currency:
                    d.letter.currency === LetterCurrency.SOLES ? 'PEN' : 'USD',
                }
              )
            }
          />
          <Column
            header="Valor recibido"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              formatCurrency(getReceivedValue(d), {
                currency:
                  d.letter.currency === LetterCurrency.SOLES ? 'PEN' : 'USD',
              })
            }
          />
          <Column
            header="Valor a pagar"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) =>
              formatCurrency(getPayValue(d), {
                currency:
                  d.letter.currency === LetterCurrency.SOLES ? 'PEN' : 'USD',
              })
            }
          />
          <Column
            header="TCEA"
            style={{ minWidth: '180px' }}
            body={(d: DiscountLetter) => `${+(getTCEA(d) * 100).toFixed(7)}%`}
          />
          <Column
            header="Fecha de descuento"
            style={{ minWidth: '200px' }}
            body={(d: DiscountLetter) => formatDate(d.discountDate)}
          />
          <Column
            header="Fecha de emisión"
            style={{ minWidth: '200px' }}
            body={(d: DiscountLetter) => formatDate(d.letter.issueDate)}
          />
          <Column
            header="Fecha de vencimiento"
            style={{ minWidth: '200px' }}
            body={(d: DiscountLetter) => formatDate(d.letter.expirationDate)}
          />
        </DataTable>
      </div>
    </BasePage>
  )
}

export default DiscountLettersPage
