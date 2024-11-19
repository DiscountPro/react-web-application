import BaseService from '@app/shared/services/baseService'

class ProfileService extends BaseService {
  constructor() {
    super()
    this.baseURL = `${this.baseURL}/users`
  }
}

export default ProfileService
