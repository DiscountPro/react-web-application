import BaseService from '@app/shared/services/baseService'

class LetterService extends BaseService {
  constructor() {
    super()
    this.baseURL = `${this.baseURL}/letters`
  }
}

export default LetterService
