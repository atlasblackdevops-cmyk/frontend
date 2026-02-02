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
        jwt: async ({ token, user, account, trigger }) => {
            // Initial sign-in
            if (user && account) {
                if (account.provider === "google") {
                    try {
                        const idToken = (account as any).id_token;
                        // Get referral code from localStorage (stored before OAuth redirect)
                        let referralCode: string | undefined;
                        if (typeof window !== "undefined") {
                            referralCode = localStorage.getItem("referralCode") || undefined;
                        }
                        
                        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`, {
                            method: 'POST',
                            body: JSON.stringify({ 
                                idToken,
                                referralCode: referralCode || undefined
                            }),
                            headers: { "Content-Type": "application/json" }
                        });
                        const response = await res.json();
                        if (res.ok && response.success) {
                            const backendData = response.data;
                            token.accessToken = backendData.accessToken;
                            token.refreshToken = backendData.refreshToken;
                            token.isSubscribed = backendData.isSubscribed;
                            token.userId = backendData.user?.id;
                            
                            // Clear referral code from localStorage after successful sign-in
                            if (typeof window !== "undefined" && referralCode) {
                                localStorage.removeItem("referralCode");
                            }
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
                }
            }
            
            // Handle token refresh via updateSession()
            // When updateSession() is called, trigger will be "update" and the new tokens are passed in the token object
            if (trigger === "update") {
                // In NextAuth v5, when updateSession() is called, the values should be in the token object
                // Explicitly set them to ensure they're persisted
                const updatedAccessToken = (token as any).accessToken;
                const updatedRefreshToken = (token as any).refreshToken;
                const updatedIsSubscribed = (token as any).isSubscribed;
                
                if (updatedAccessToken && updatedAccessToken !== token.accessToken) {
                    token.accessToken = updatedAccessToken;
                }
                if (updatedRefreshToken && updatedRefreshToken !== token.refreshToken) {
                    token.refreshToken = updatedRefreshToken;
                }
                if (updatedIsSubscribed !== undefined) {
                    token.isSubscribed = updatedIsSubscribed;
                }
            }
            
            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                (session.user as any).id = token.userId || token.sub;
                (session as any).accessToken = token.accessToken;
                (session as any).refreshToken = token.refreshToken;
                (session as any).isSubscribed = token.isSubscribed;
            }
            return session;
        },
    },
});
