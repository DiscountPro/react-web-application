import { User } from '@app/auth/model/user'
import { Letter } from '../letters/model/letter'

export interface DiscountLetter {
  id: number
  letter: Letter
  creditor: User
  client: User
  bank: User
  discountPercentage: number
  discountDate: Date
}

export interface GetDiscountLetterDto {
  id: number
  letterId: number
  creditorId: number
  clientId: number
  bankId: number
  discountPercentage: number
  discountDate: string
}
