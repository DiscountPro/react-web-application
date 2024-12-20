export interface User {
  id: number
  username: string
  password: string
  ruc: string
  companyName: string
  role: UserRole
}

export enum UserRole {
  ADMIN = 'ADMINISTRATOR',
  CREDITOR = 'CREDITOR',
  CLIENT = 'CLIENT',
  BANK = 'BANK',
}
