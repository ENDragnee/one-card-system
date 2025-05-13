// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password-utils'; // Assuming you have this utility
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
            // Standard error NextAuth uses for bad credentials
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
            role: user.role, // Include the role
            username: user.username,
          };
        } catch (error) {
          console.error('Authorization Error:', error);
          // Ensure 'CredentialsSignin' is thrown for client-side error handling consistency
          if (error instanceof Error && error.message === 'CredentialsSignin') {
            throw error;
          }
          throw new Error('CredentialsSignin'); // Fallback generic auth error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/onboarding', // Your login page is at /onboarding
    // signOut: '/auth/signout', // Default is fine
    // error: '/auth/error', // Default for auth errors (e.g. CredentialsSignin)
  },
  callbacks: {
    async jwt({ token, user }) {
      // `user` object is available only on sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role; // User interface already augmented
        token.username = (user as any).username; // Cast if needed
        // Persist other user properties to the token if desired
        // token.name = user.name;
        // token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer properties from JWT token to session object
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        // session.user.name = token.name as string | null | undefined;
        // session.user.email = token.email as string | null | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };