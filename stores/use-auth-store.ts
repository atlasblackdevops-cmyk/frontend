import { create } from "zustand";

interface OAuthProfile {
    id: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
}

export interface Permission {
    id: string;
    module: string;
    action: string;
    description?: string;
}

export interface AuthStore {
    token: string | null;
    refreshToken: string | null;
    auth: OAuthProfile | null;
    userId: string | null;
    role: string | null;
    hasFarm: boolean | null;
    farmId: string | null;
    farmName: string | null;
    userName: string | null;
    userEmail: string | null;
    userProfilePicture: string | null;
    permissions: Permission[];
    referralCode: string | null;
    totalReferralPoints: number;
    availableReferralPoints: number;
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    setToken: (token: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    setAuth: (auth: OAuthProfile) => void;
    setUserId: (userId: string | null) => void;
    setRoleAndFarm: (payload: {
        role?: string | null;
        hasFarm?: boolean | null;
        farmId?: string | null;
        farmName?: string | null;
    }) => void;
    setUserData: (payload: {
        name?: string | null;
        email?: string | null;
        profilePicture?: string | null;
    }) => void;
    setReferralData: (payload: {
        referralCode?: string | null;
        totalReferralPoints?: number;
        availableReferralPoints?: number;
        totalReferrals?: number;
        successfulReferrals?: number;
        pendingReferrals?: number;
    }) => void;
    setIsSubscribed: (isSubscribed: boolean) => void;
    isSubscribed: boolean;
    setPermissions: (permissions: Permission[]) => void;
}

export const useAuth = create<AuthStore>((set) => ({
    token: null,
    refreshToken: null,
    auth: null,
    userId: null,
    role: null,
    hasFarm: null,
    farmId: null,
    farmName: null,
    userName: null,
    userEmail: null,
    userProfilePicture: null,
    permissions: [],
    referralCode: null,
    totalReferralPoints: 0,
    availableReferralPoints: 0,
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    isSubscribed:false,
    setIsSubscribed: (isSubscribed: boolean) => set({ isSubscribed }),
    setToken: (token: string | null) => set({ token }),
    setRefreshToken: (refreshToken: string | null) => set({ refreshToken }),
    setAuth: (auth: OAuthProfile) => set({ auth }),
    setUserId: (userId: string | null) => set({ userId }),
    setRoleAndFarm: ({ role, hasFarm, farmId, farmName }) =>
        set((prev) => ({
            role: role ?? prev.role,
            hasFarm: typeof hasFarm === "boolean" ? hasFarm : prev.hasFarm,
            farmId:
                typeof farmId === "string"
                    ? farmId
                    : farmId === null
                      ? null
                      : prev.farmId,
            farmName:
                typeof farmName === "string"
                    ? farmName
                    : farmName === null
                      ? null
                      : prev.farmName,
        })),
    setUserData: ({ name, email, profilePicture }) =>
        set((prev) => ({
            userName: name !== undefined ? name : prev.userName,
            userEmail: email !== undefined ? email : prev.userEmail,
            userProfilePicture:
                profilePicture !== undefined
                    ? profilePicture
                    : prev.userProfilePicture,
        })),
    setReferralData: ({ referralCode, totalReferralPoints, availableReferralPoints, totalReferrals, successfulReferrals, pendingReferrals }) =>
        set((prev) => ({
            referralCode: referralCode !== undefined ? referralCode : prev.referralCode,
            totalReferralPoints: totalReferralPoints !== undefined ? totalReferralPoints : prev.totalReferralPoints,
            availableReferralPoints: availableReferralPoints !== undefined ? availableReferralPoints : prev.availableReferralPoints,
            totalReferrals: totalReferrals !== undefined ? totalReferrals : prev.totalReferrals,
            successfulReferrals: successfulReferrals !== undefined ? successfulReferrals : prev.successfulReferrals,
            pendingReferrals: pendingReferrals !== undefined ? pendingReferrals : prev.pendingReferrals,
        })),
    setPermissions: (permissions: Permission[]) => set({ permissions }),
}));
