// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password-utils'; // Ensure this utility exists
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error('Username and password are required.');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.password) {
            throw new Error('CredentialsSignin');
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          if (!isValid) {
            throw new Error('CredentialsSignin');
          }

          // Return the user object that NextAuth expects, plus custom properties
          return {
            id: user.id.toString(), // NextAuth User 'id' is string
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username,
            changedPassword: user.changedPassword, // <<< ADDED THIS
            completed: user.completed, // <<< ADDED THIS
          };
        } catch (error) {
          console.error('Authorization Error:', error);
          if (error instanceof Error && error.message === 'CredentialsSignin') {
            throw error;
          }
          throw new Error('CredentialsSignin');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/onboarding',
  },
  callbacks: {
    async jwt({ token, user, trigger, session: newSessionDataFromUpdate }) {
      // `user` object is available on sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.changedPassword = user.changedPassword; // <<< ADDED THIS
        token.completed = user.completed; // <<< ADDED THIS
      }

      // Handle session updates via useSession().update()
      if (trigger === "update" && newSessionDataFromUpdate) {
        if (typeof newSessionDataFromUpdate.changedPassword === 'boolean') {
          token.changedPassword = newSessionDataFromUpdate.changedPassword;
        }
        // Update other fields if necessary
        // token.name = newSessionDataFromUpdate.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer properties from JWT token to session object
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.changedPassword = token.changedPassword; // <<< ADDED THIS
        session.user.completed = token.completed; // <<< ADDED THIS
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };