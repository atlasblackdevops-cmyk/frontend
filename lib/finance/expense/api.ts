import { api } from "@/lib/api";
import type {
    ExpensesApiResponse,
    ExpenseDetailsResponse,
    ExpenseRecord,
    ApiExpenseResponse,
    GetExpensesParams,
    CreateExpenseData,
    ExpenseCategoriesResponse,
    ExpenseCategory,
} from "@/components/finance/expense/types";

/**
 * Get list of expenses with filters and pagination
 */
export async function getExpenses(
    params: GetExpensesParams = {}
): Promise<ExpensesApiResponse> {
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
    if (params.categoryId && params.categoryId !== "all") {
        queryParams.append("categoryId", params.categoryId);
    }
    if (params.expenseDateFrom) {
        queryParams.append("expenseDateFrom", params.expenseDateFrom);
    }
    if (params.expenseDateTo) {
        queryParams.append("expenseDateTo", params.expenseDateTo);
    }

    const response = await api.get<ExpensesApiResponse>(
        `/api/v1/finance/expenses?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single expense details by ID
 */
export async function getExpenseDetails(
    expenseId: string
): Promise<ExpenseRecord> {
    const response = await api.get<ExpenseDetailsResponse>(
        `/api/v1/finance/expenses/${expenseId}`
    );

    const responseData = response.data?.data ?? response.data;
    const expenseData = responseData?.expense;

    if (!expenseData) {
        throw new Error("Expense data not found");
    }

    return {
        id: expenseData.id,
        categoryId: expenseData.categoryId || expenseData.category?.id || null,
        otherCategoryName: expenseData.otherCategoryName,
        categoryName:
            expenseData.category?.categoryName ||
            expenseData.otherCategoryName ||
            "Unknown",
        expenseDate: expenseData.expenseDate,
        amount:
            typeof expenseData.amount === "string"
                ? parseFloat(expenseData.amount)
                : expenseData.amount,
        currencyType: expenseData.currencyType,
        vendor: expenseData.vendor,
        description: expenseData.description,
        paymentMethod: expenseData.paymentMethod,
        createdAt: expenseData.createdAt,
        updatedAt: expenseData.updatedAt,
        category: expenseData.category,
    };
}

/**
 * Create a new expense record
 */
export async function createExpense(data: CreateExpenseData): Promise<void> {
    const payload: any = {
        expenseDate: data.expenseDate,
        amount: data.amount,
        currencyType: data.currencyType,
    };

    if (data.categoryId) {
        payload.categoryId = data.categoryId;
    }
    if (data.otherCategoryName?.trim()) {
        payload.otherCategoryName = data.otherCategoryName.trim();
    }
    if (data.vendor?.trim()) {
        payload.vendor = data.vendor.trim();
    }
    if (data.description?.trim()) {
        payload.description = data.description.trim();
    }
    if (data.paymentMethod?.trim()) {
        payload.paymentMethod = data.paymentMethod.trim();
    }

    await api.post("/api/v1/finance/expenses", payload);
}

/**
 * Update an existing expense record
 */
export async function updateExpense(
    expenseId: string,
    data: CreateExpenseData
): Promise<void> {
    const payload: any = {
        expenseDate: data.expenseDate,
        amount: data.amount,
        currencyType: data.currencyType,
    };

    if (data.categoryId) {
        payload.categoryId = data.categoryId;
    }
    if (data.otherCategoryName?.trim()) {
        payload.otherCategoryName = data.otherCategoryName.trim();
    }
    if (data.vendor?.trim()) {
        payload.vendor = data.vendor.trim();
    }
    if (data.description?.trim()) {
        payload.description = data.description.trim();
    }
    if (data.paymentMethod?.trim()) {
        payload.paymentMethod = data.paymentMethod.trim();
    }

    await api.put(`/api/v1/finance/expenses/${expenseId}`, payload);
}

/**
 * Delete an expense record
 */
export async function deleteExpense(expenseId: string): Promise<void> {
    await api.delete(`/api/v1/finance/expenses/${expenseId}`);
}

/**
 * Get list of expense categories
 */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await api.get<ExpenseCategoriesResponse>(
        `/api/v1/finance/expense-categories`
    );

    const responseData = response.data?.data ?? response.data;
    const categories = responseData?.categories ?? [];

    return Array.isArray(categories) ? categories : [];
}
