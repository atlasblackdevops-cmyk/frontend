export type ExpenseRecord = {
    id: string;
    categoryId?: string | null;
    otherCategoryName?: string | null;
    categoryName?: string; // For display purposes (from category or otherCategoryName)
    expenseDate: string;
    amount: number;
    currencyType: string;
    vendor?: string | null;
    description?: string | null;
    paymentMethod?: string | null;
    createdAt: string;
    updatedAt: string;
    category?: {
        id: string;
        categoryName: string;
        slug: string;
    } | null;
};

export type ApiExpenseResponse = {
    id: string;
    categoryId?: string | null;
    otherCategoryName?: string | null;
    expenseDate: string;
    amount: number;
    currencyType: string;
    vendor?: string | null;
    description?: string | null;
    paymentMethod?: string | null;
    createdAt: string;
    updatedAt: string;
    category?: {
        id: string;
        categoryName: string;
        slug: string;
    } | null;
};

export type ExpensesApiResponse = {
    message: string;
    data: {
        expenses: ApiExpenseResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type ExpenseDetailsResponse = {
    message: string;
    data: {
        expense: ApiExpenseResponse;
    };
};

export type ExpenseCategory = {
    id: string;
    categoryName: string;
    slug: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ExpenseCategoriesResponse = {
    message: string;
    data: {
        categories: ExpenseCategory[];
    };
};

export type AddExpenseValues = {
    categoryId?: string;
    otherCategoryName?: string;
    expenseDate: string;
    amount: number | "";
    currencyType: string;
    vendor?: string;
    description?: string;
    paymentMethod?: string;
};

export type FilterValues = {
    search: string;
    categoryId: string;
    expenseDateFrom: string;
    expenseDateTo: string;
};

export type GetExpensesParams = {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    expenseDateFrom?: string;
    expenseDateTo?: string;
};

export type CreateExpenseData = {
    categoryId?: string;
    otherCategoryName?: string;
    expenseDate: string;
    amount: number;
    currencyType: string;
    vendor?: string;
    description?: string;
    paymentMethod?: string;
};

export type ExpenseTableProps = {
    expenses: ExpenseRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (expense: ExpenseRecord) => void;
    onDelete: (expense: ExpenseRecord) => void;
    onPageChange: (page: number) => void;
};

export type ExpenseModalProps = {
    mode: "create" | "update";
    expense?: ExpenseRecord;
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: unknown) => Promise<void>;
    isSubmitting: boolean;
};

export const CURRENCY_OPTIONS = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
];

export const PAYMENT_METHOD_OPTIONS = [
    { value: "Cash", label: "Cash" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Check", label: "Check" },
    { value: "PayPal", label: "PayPal" },
    { value: "Other", label: "Other" },
];

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

