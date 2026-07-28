/**
 * Edge-safe Auth.js base config. Contains NO providers that import Node-only
 * modules (mongoose/bcrypt) so it can be used by middleware on the edge. The
 * Credentials provider with the real DB `authorize` is added in `auth.js`
 * (Node runtime only).
 */
export const authConfig = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8h
  pages: { signIn: '/admin/login' },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
}
