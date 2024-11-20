export interface Letter {
  id: number
  currency: LetterCurrency
  amount: number
  issueDate: string
  expirationDate: string
  interestRate: number
  interestRateType: InterestRateType
  interestRateFrequencyDays: number
  capitalizationDays?: number
  clientId: number
  ownerId: number
  expenses: LetterExpenses
  isDiscounted: boolean
}

export interface LetterExpenses {
  initialExpenses: number
  finalExpenses: number
}

export enum LetterCurrency {
  SOLES = 'SOLES',
  DOLLARS = 'DOLLARS',
}

export enum InterestRateType {
  NOMINAL = 'NOMINAL',
  EFFECTIVE = 'EFFECTIVE',
}

export interface CreateLetterDto {
  currency: LetterCurrency
  amount: number
  issueDate: string
  expirationDate: string
  interestRate: number
  interestRateType: InterestRateType
  capitalizationDays?: number
  clientId: number
  ownerId: number
  interestRateFrequencyDays: number
  expenses: LetterExpenses
  isDiscounted: boolean
}
