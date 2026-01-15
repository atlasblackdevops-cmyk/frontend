import { api } from "@/lib/api";
import type {
    RevenuesApiResponse,
    RevenueDetailsResponse,
    RevenueRecord,
    ApiRevenueResponse,
    GetRevenuesParams,
    CreateRevenueData,
} from "@/components/finance/revenue/types";

/**
 * Get list of revenues with filters and pagination
 */
export async function getRevenues(
    params: GetRevenuesParams = {}
): Promise<RevenuesApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }
    if (params.revenueDateFrom) {
        queryParams.append("revenueDateFrom", params.revenueDateFrom);
    }
    if (params.revenueDateTo) {
        queryParams.append("revenueDateTo", params.revenueDateTo);
    }

    const response = await api.get<RevenuesApiResponse>(
        `/api/v1/finance/revenues?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single revenue details by ID
 */
export async function getRevenueDetails(
    revenueId: string
): Promise<RevenueRecord> {
    const response = await api.get<RevenueDetailsResponse>(
        `/api/v1/finance/revenues/${revenueId}`
    );

    const responseData = response.data?.data ?? response.data;
    const revenueData = responseData?.revenue;

    if (!revenueData) {
        throw new Error("Revenue data not found");
    }

    return {
        id: revenueData.id,
        revenueDate: revenueData.revenueDate,
        amount: typeof revenueData.amount === "string" ? parseFloat(revenueData.amount) : revenueData.amount,
        currencyType: revenueData.currencyType,
        buyerName: revenueData.buyerName,
        productSold: revenueData.productSold,
        quantity: revenueData.quantity,
        quantityUnit: revenueData.quantityUnit,
        paymentMethod: revenueData.paymentMethod,
        notes: revenueData.notes,
        createdAt: revenueData.createdAt,
        updatedAt: revenueData.updatedAt,
    };
}

/**
 * Create a new revenue record
 */
export async function createRevenue(data: CreateRevenueData): Promise<void> {
    const payload: any = {
        revenueDate: data.revenueDate,
        amount: data.amount,
        currencyType: data.currencyType,
    };

    if (data.buyerName?.trim()) {
        payload.buyerName = data.buyerName.trim();
    }
    if (data.productSold?.trim()) {
        payload.productSold = data.productSold.trim();
    }
    if (data.quantity !== undefined && data.quantity !== null) {
        payload.quantity = data.quantity;
    }
    if (data.quantityUnit?.trim()) {
        payload.quantityUnit = data.quantityUnit.trim();
    }
    if (data.paymentMethod?.trim()) {
        payload.paymentMethod = data.paymentMethod.trim();
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/finance/revenues", payload);
}

/**
 * Update an existing revenue record
 */
export async function updateRevenue(
    revenueId: string,
    data: CreateRevenueData
): Promise<void> {
    const payload: any = {
        revenueDate: data.revenueDate,
        amount: data.amount,
        currencyType: data.currencyType,
    };

    if (data.buyerName?.trim()) {
        payload.buyerName = data.buyerName.trim();
    }
    if (data.productSold?.trim()) {
        payload.productSold = data.productSold.trim();
    }
    if (data.quantity !== undefined && data.quantity !== null) {
        payload.quantity = data.quantity;
    }
    if (data.quantityUnit?.trim()) {
        payload.quantityUnit = data.quantityUnit.trim();
    }
    if (data.paymentMethod?.trim()) {
        payload.paymentMethod = data.paymentMethod.trim();
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.put(`/api/v1/finance/revenues/${revenueId}`, payload);
}

/**
 * Delete a revenue record
 */
export async function deleteRevenue(revenueId: string): Promise<void> {
    await api.delete(`/api/v1/finance/revenues/${revenueId}`);
}

