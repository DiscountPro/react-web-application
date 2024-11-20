import axios from 'axios'
import { User } from '../model/user'

export class UserService {
  private static baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/users`
    : 'http://localhost:3000/api/v1/users'

  static async register(user: Omit<User, 'id'>) {
    const response = await axios.post<User>(UserService.baseURL, user)

    return response
  }

  static async login(username: string, password: string) {
    const response = await axios.get<User[]>(
      `${UserService.baseURL}?username=${username}&password=${password}`
    )

    return response
  }
}
