import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Reviewer Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@razorpay.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "test@razorpay.com" && credentials?.password === "razorpay123") {
          let user = await db.user.findUnique({ where: { email: "test@razorpay.com" } })
          if (!user) {
            user = await db.user.create({
              data: {
                email: "test@razorpay.com",
                name: "Razorpay Reviewer",
                image: "https://ui-avatars.com/api/?name=Razorpay+Reviewer&background=0D8ABC&color=fff"
              }
            })
          }
          return user
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
})
