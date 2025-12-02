import { api } from "@/lib/api";
import type {
    ApiUserResponse,
    UsersApiResponse,
    ExistingUserResponse,
    AccessRole,
    PermissionModule,
    PaginationInfo,
} from "@/components/users/types";

export interface GetUsersParams {
    page?: number;
    limit?: number;
    roleId?: string;
    isActive?: string;
    search?: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    roleId: string;
    permissionIds?: string[];
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
    isActive?: boolean;
    permissionIds?: string[];
}

export interface AddExistingUserData {
    userId: string;
    roleId: string;
    permissionIds?: string[];
}

export const getUsers = async (
    params: GetUsersParams = {}
): Promise<{ users: ApiUserResponse[]; pagination: PaginationInfo }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.roleId) queryParams.append("roleId", params.roleId);
    if (params.isActive) queryParams.append("isActive", params.isActive);
    if (params.search) queryParams.append("search", params.search);

    const response = await api.get<UsersApiResponse>(
        `/api/v1/users?${queryParams.toString()}`
    );
    const responseData = response.data?.data ?? response.data;
    return {
        users: responseData?.users ?? [],
        pagination:
            responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
    };
};

export const getAllUsers = async (
    search?: string
): Promise<ExistingUserResponse[]> => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);

    const response = await api.get<{ data?: { users?: ExistingUserResponse[] } }>(
        `/api/v1/users/all?${queryParams.toString()}`
    );
    const responseData = response.data?.data;
    return responseData?.users ?? [];
};

export const getRoles = async (): Promise<AccessRole[]> => {
    const response = await api.get<{ data?: AccessRole[] }>(
        "/api/v1/access/roles"
    );
    const payload = Array.isArray(response.data?.data)
        ? (response.data.data as AccessRole[])
        : [];
    return payload;
};

export const getPermissions = async (): Promise<PermissionModule[]> => {
    const response = await api.get<{ data?: PermissionModule[] }>(
        "/api/v1/access/permissions"
    );
    const payload = Array.isArray(response.data?.data)
        ? (response.data.data as PermissionModule[])
        : [];
    return payload;
};

export const createUser = async (
    data: CreateUserData
): Promise<ApiUserResponse> => {
    const response = await api.post<{ data?: ApiUserResponse } | ApiUserResponse>(
        "/api/v1/users",
        data
    );
    return (response.data as { data?: ApiUserResponse })?.data ?? (response.data as ApiUserResponse);
};

export const updateUser = async (
    userId: string,
    data: UpdateUserData
): Promise<ApiUserResponse> => {
    const response = await api.put<{ data?: ApiUserResponse } | ApiUserResponse>(
        `/api/v1/users/${userId}`,
        data
    );
    return (response.data as { data?: ApiUserResponse })?.data ?? (response.data as ApiUserResponse);
};

export const addExistingUser = async (
    data: AddExistingUserData
): Promise<ApiUserResponse> => {
    const response = await api.post<{ data?: ApiUserResponse } | ApiUserResponse>(
        "/api/v1/users/add-existing",
        data
    );
    return (response.data as { data?: ApiUserResponse })?.data ?? (response.data as ApiUserResponse);
};

