import { api } from "@/lib/api";
import type {
    DashboardSummaryResponse,
    DashboardTrendsResponse,
    DashboardBreakdownResponse,
    GetDashboardSummaryParams,
    GetDashboardTrendsParams,
    GetDashboardBreakdownParams,
} from "@/components/finance/dashboard/types";

/**
 * Get dashboard summary with metrics
 */
export async function getDashboardSummary(
    params: GetDashboardSummaryParams = {}
): Promise<DashboardSummaryResponse> {
    const queryParams = new URLSearchParams();

    if (params.dateFrom) {
        queryParams.append("dateFrom", params.dateFrom);
    }
    if (params.dateTo) {
        queryParams.append("dateTo", params.dateTo);
    }
    if (params.currency) {
        queryParams.append("currency", params.currency);
    }
    if (params.period) {
        queryParams.append("period", params.period);
    }

    const response = await api.get<{
        success: boolean;
        statusCode: number;
        message: string;
        data: DashboardSummaryResponse;
    }>(`/api/v1/finance/dashboard/summary?${queryParams.toString()}`);

    return response.data.data;
}

/**
 * Get dashboard trends data
 */
export async function getDashboardTrends(
    params: GetDashboardTrendsParams
): Promise<DashboardTrendsResponse> {
    const queryParams = new URLSearchParams();

    queryParams.append("dateFrom", params.dateFrom);
    queryParams.append("dateTo", params.dateTo);
    queryParams.append("groupBy", params.groupBy);
    if (params.currency) {
        queryParams.append("currency", params.currency);
    }

    const response = await api.get<{
        success: boolean;
        statusCode: number;
        message: string;
        data: DashboardTrendsResponse;
    }>(`/api/v1/finance/dashboard/trends?${queryParams.toString()}`);

    return response.data.data;
}

/**
 * Get dashboard breakdown data
 */
export async function getDashboardBreakdown(
    params: GetDashboardBreakdownParams = {}
): Promise<DashboardBreakdownResponse> {
    const queryParams = new URLSearchParams();

    if (params.dateFrom) {
        queryParams.append("dateFrom", params.dateFrom);
    }
    if (params.dateTo) {
        queryParams.append("dateTo", params.dateTo);
    }
    if (params.type) {
        queryParams.append("type", params.type);
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.currency) {
        queryParams.append("currency", params.currency);
    }

    const response = await api.get<{
        success: boolean;
        statusCode: number;
        message: string;
        data: DashboardBreakdownResponse;
    }>(`/api/v1/finance/dashboard/breakdown?${queryParams.toString()}`);

    return response.data.data;
}

