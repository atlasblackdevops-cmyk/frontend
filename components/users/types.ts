export type PermissionMatrix = Record<string, string[]>;

export interface ModuleDefinition {
    module: string;
    actions: string[];
}

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive";
    roleId: string;
    roleName?: string;
    permissions: PermissionMatrix;
    avatarColor: string;
    isActive: boolean;
    createdAt?: string;
}

export interface ApiUserResponse {
    farmMemberId?: string;
    user: {
        id: string;
        email: string;
        name: string;
        mobile?: string;
        isActive: boolean;
        emailVerified: boolean;
        createdAt: string;
        updatedAt?: string;
        role: {
            id: string;
            roleName: string;
        };
    };
    role: {
        id: string;
        roleName: string;
    };
    permissions: Array<{
        id: string;
        module: string;
        action: string;
        description?: string;
    }>;
    createdAt: string;
    updatedAt?: string;
}

export interface ExistingUserResponse {
    id: string;
    email: string;
    name: string;
    mobile?: string | null;
    isActive: boolean;
    emailVerified: boolean;
    farms?: Array<{
        farmMemberId: string;
        farm: {
            id: string;
            farmName: string;
        };
        role: {
            id: string;
            roleName: string;
        };
    }>;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AccessRole {
    id: string;
    roleName?: string | null;
}

export interface PermissionActionDefinition {
    id: string;
    action: string;
    description?: string;
}

export interface PermissionModule {
    module: string;
    actions: PermissionActionDefinition[];
}

export interface UsersApiResponse {
    message?: string;
    data?: {
        users: ApiUserResponse[];
        pagination: PaginationInfo;
    };
    users?: ApiUserResponse[];
    pagination?: PaginationInfo;
}
