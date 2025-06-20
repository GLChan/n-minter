import NextAuth, { AuthOptions, Session } from "next-auth";
// import Google from "next-auth/providers/google";
import { createGuest, getProfileByWallet } from "./data-service";

const authConfig = {
  providers: [

  ],
  callbacks: {
    authorized({ auth, request }: { auth: Session, request: Request }) {
      console.log('authorized', auth, request)
      return !!auth?.user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: { user: any, account: any, profile: any }) {
      try {

        console.log('signIn', user, account, profile)
        const existingGuest = await getProfileByWallet(user.wallet_address);

        if (!existingGuest)
          await createGuest({ wallet_address: user.wallet_address });

        return true;
      } catch {
        return false;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user }: { session: any, user: any }) {
      console.log('session', session, user)
      const guest = await getProfileByWallet(session.user.wallet_address);
      session.user.id = guest.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers,
} = NextAuth(authConfig as AuthOptions);
