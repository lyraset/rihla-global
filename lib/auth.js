import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config.js'
import { findAdminByEmail, touchLastLogin } from '../services/admin-users.js'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const user = await findAdminByEmail(creds.email)
        if (!user) return null
        const valid = await bcrypt.compare(String(creds.password), user.passwordHash || '')
        if (!valid) return null
        await touchLastLogin(user._id)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
})
