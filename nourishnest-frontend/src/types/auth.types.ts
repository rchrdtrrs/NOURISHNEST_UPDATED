export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  first_name?: string
  last_name?: string
  password: string
  password_confirm: string
}

export interface TokenPair {
  access: string
  refresh: string
}

