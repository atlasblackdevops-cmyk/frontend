import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env } from "./env";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    max_age: 300,
                    scope: "openid email profile",
                },
            },
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                // Allow passing the backend response directly if we already have it from a registration
                backendResponse: { label: "Backend Response", type: "text" },
            },
            async authorize(credentials) {
                if (credentials?.backendResponse) {
                    try {
                        return JSON.parse(credentials.backendResponse as string);
                    } catch (e) {
                        return null;
                    }
                }

                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const response = await res.json();
                    if (res.ok && response.success) {
                        return response.data;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            }
        })
    ],
    secret: env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    callbacks: {
        jwt: async ({ token, user, account }) => {
            // Initial sign-in
            if (user && account) {
                console.log(`[NextAuth JWT] Initial sign-in for provider: ${account.provider}`);
                if (account.provider === "google") {
                    try {
                        const idToken = (account as any).id_token;
                        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`, {
                            method: 'POST',
                            body: JSON.stringify({ idToken }),
                            headers: { "Content-Type": "application/json" }
                        });
                        const response = await res.json();
                        if (res.ok && response.success) {
                            const backendData = response.data;
                            token.accessToken = backendData.accessToken;
                            token.refreshToken = backendData.refreshToken;
                            token.isSubscribed = backendData.isSubscribed;
                            token.userId = backendData.user?.id;
                            console.log(`[NextAuth JWT] Google sync success. isSubscribed: ${token.isSubscribed}`);
                        } else {
                            console.error(`[NextAuth JWT] Google sync failed:`, response);
                        }
                    } catch (e) {
                        console.error("[NextAuth JWT] Backend Google sync error:", e);
                    }
                } else if (account.provider === "credentials") {
                    const backendData = user as any;
                    token.accessToken = backendData.accessToken;
                    token.refreshToken = backendData.refreshToken;
                    token.isSubscribed = backendData.isSubscribed;
                    token.userId = backendData.user?.id;
                    console.log(`[NextAuth JWT] Credentials login success. isSubscribed: ${token.isSubscribed}`);
                }
            }
            
            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                (session.user as any).id = token.userId || token.sub;
                (session as any).accessToken = token.accessToken;
                (session as any).isSubscribed = token.isSubscribed;
            }
            console.log(`[NextAuth Session] Session updated. isLoggedIn: ${!!(session as any).accessToken}, isSubscribed: ${(session as any).isSubscribed}`);
            return session;
        },
    },
});
