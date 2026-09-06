declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string | null
    role: 'USER' | 'ADMIN'
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}
