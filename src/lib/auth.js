import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from './password-utils'; // For password hashing (optional)
import db from './db'; // Database connection

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        university: { label: 'universtiy', type: 'text', placeholder: 'example@domain.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate user credentials
          const [userRows] = await db.execute(
            'SELECT * FROM university WHERE name = ?',
            [credentials.university]
          );

          if (userRows.length === 0) {
            throw new Error('User not found');
          }

          const user = userRows[0];

          // Verify password (optional, implement hashing as needed)
          const isValid = await verifyPassword(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user.id,
            name: user.name,
          };
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
