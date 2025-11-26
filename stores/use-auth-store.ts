import { create } from 'zustand';

interface OAuthProfile {
  id: string;
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
}

export interface AuthStore {
  token: string | null;
  auth: OAuthProfile | null;
  userId: string | null;
  role: string | null;
  hasFarm: boolean | null;
  farmId: string | null;
  setToken: (token: string | null) => void;
  setAuth: (auth: OAuthProfile) => void;
  setUserId: (userId: string | null) => void;
  setRoleAndFarm: (payload: {
    role?: string | null;
    hasFarm?: boolean | null;
    farmId?: string | null;
  }) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  token: null,
  auth: null,
  userId: null,
  role: null,
  hasFarm: null,
  farmId: null,
  setToken: (token: string | null) => set({ token }),
  setAuth: (auth: OAuthProfile) => set({ auth }),
  setUserId: (userId: string | null) => set({ userId }),
  setRoleAndFarm: ({ role, hasFarm, farmId }) =>
    set((prev) => ({
      role: role ?? prev.role,
      hasFarm: typeof hasFarm === 'boolean' ? hasFarm : prev.hasFarm,
      farmId: typeof farmId === 'string' ? farmId : farmId === null ? null : prev.farmId,
    })),
}));
