import BaseService from '@app/shared/services/baseService'

class LetterService extends BaseService {
  constructor() {
    super()
    this.baseURL = `${this.baseURL}/letters`
  }

  async discountLetter(id: number) {
    const response = await this.http.patch(`${this.baseURL}/${id}`, {
      isDiscounted: true,
    })

    return response.data
  }
}

export default LetterService
