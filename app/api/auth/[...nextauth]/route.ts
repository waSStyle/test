import NextAuth, { type NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user.id

        // Get Discord roles from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { roles: true },
        })

        if (dbUser) {
          session.user.roles = dbUser.roles.map((role) => role.name)
          session.user.discordId = dbUser.discordId
          session.user.mcUuid = dbUser.mcUuid
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        // Update or create user with Discord data
        const discordProfile = profile as any

        try {
          await prisma.user.upsert({
            where: { discordId: discordProfile.id },
            update: {
              username: discordProfile.username,
              discriminator: discordProfile.discriminator,
              avatar: discordProfile.avatar,
              email: discordProfile.email,
            },
            create: {
              discordId: discordProfile.id,
              username: discordProfile.username,
              discriminator: discordProfile.discriminator,
              avatar: discordProfile.avatar,
              email: discordProfile.email,
            },
          })

          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

