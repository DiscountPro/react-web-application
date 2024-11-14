export interface Letter {
  id: number
  currency: LetterCurrency
  amount: number
  issueDate: string
  expirationDate: string
  interestRate: number
  interestRateType: InterestRateType
  capitalizationDays?: number
  expenseId: number
  clientId: number
  ownerId: number
}

export interface LetterExpenses {
  id: number
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
