// types/next-auth.d.ts
import { Role } from '@prisma/client'; // Import your Prisma Role enum
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // User ID is typically a string in NextAuth session
      role: Role;
      username?: string;
    } & DefaultSession['user']; // Keep existing properties like name, email, image
  }

  // Used by the authorize callback
  interface User extends DefaultUser {
    // id is already string in DefaultUser
    role: Role;
    username?: string; // Add this if you return it from authorize
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    username?: string;
  }
}