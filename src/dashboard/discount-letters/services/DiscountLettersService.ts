import { Letter } from '@app/dashboard/letters/model/letter'
import LetterService from '@app/dashboard/letters/services/letterService'
import ProfileService from '@app/dashboard/profile/services/profileService'
import BaseService from '@app/shared/services/baseService'
import { DiscountLetter, GetDiscountLetterDto } from '../discountLetter'
import { User } from '@app/auth/model/user'
import { AxiosRequestConfig } from 'axios'

const profileService = new ProfileService()
const letterService = new LetterService()

class DiscountLettersService extends BaseService {
  constructor() {
    super()
    this.baseURL = `${this.baseURL}/discount-letters`
  }

  async getAllWithLetterAndProfile(config?: AxiosRequestConfig) {
    const [letters, profiles, discountLetters] = await Promise.all([
      letterService.getAll<Letter>(config),
      profileService.getAll<User>(config),
      this.getAll<GetDiscountLetterDto>(config),
    ])

    const data: DiscountLetter[] = discountLetters.map((d) => {
      const letter = letters.find((l) => l.id === d.letterId) as Letter
      const bank = profiles.find((p) => p.id === d.bankId) as User
      const client = profiles.find((p) => p.id === d.clientId) as User
      const creditor = profiles.find((p) => p.id === d.creditorId) as User

      return {
        ...d,
        letter,
        bank,
        client,
        creditor,
        discountDate: new Date(d.discountDate),
      }
    })

    return data
  }
}

export default DiscountLettersService
