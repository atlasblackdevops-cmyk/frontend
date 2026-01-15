export type RevenueRecord = {
    id: string;
    revenueDate: string;
    amount: number;
    currencyType: string;
    buyerName?: string | null;
    productSold?: string | null;
    quantity?: number | null;
    quantityUnit?: string | null;
    paymentMethod?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ApiRevenueResponse = {
    id: string;
    revenueDate: string;
    amount: number;
    currencyType: string;
    buyerName?: string | null;
    productSold?: string | null;
    quantity?: number | null;
    quantityUnit?: string | null;
    paymentMethod?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type RevenuesApiResponse = {
    message: string;
    data: {
        revenues: ApiRevenueResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type RevenueDetailsResponse = {
    message: string;
    data: {
        revenue: ApiRevenueResponse;
    };
};

export type AddRevenueValues = {
    revenueDate: string;
    amount: number | "";
    currencyType: string;
    buyerName?: string;
    productSold?: string;
    quantity?: number | "";
    quantityUnit?: string;
    paymentMethod?: string;
    notes?: string;
};

export type FilterValues = {
    search: string;
    revenueDateFrom: string;
    revenueDateTo: string;
};

export type GetRevenuesParams = {
    page?: number;
    limit?: number;
    search?: string;
    revenueDateFrom?: string;
    revenueDateTo?: string;
};

export type CreateRevenueData = {
    revenueDate: string;
    amount: number;
    currencyType: string;
    buyerName?: string;
    productSold?: string;
    quantity?: number;
    quantityUnit?: string;
    paymentMethod?: string;
    notes?: string;
};

export type RevenueTableProps = {
    revenues: RevenueRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (revenue: RevenueRecord) => void;
    onDelete: (revenue: RevenueRecord) => void;
    onPageChange: (page: number) => void;
};

export type RevenueModalProps = {
    mode: "create" | "update";
    revenue?: RevenueRecord;
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: unknown) => Promise<void>;
    isSubmitting: boolean;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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

export const QUANTITY_UNIT_OPTIONS = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "lb", label: "Pounds (lb)" },
    { value: "oz", label: "Ounces (oz)" },
    { value: "ton", label: "Tons" },
    { value: "mt", label: "Metric Tons" },
    { value: "l", label: "Liters (l)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "gal", label: "Gallons (gal)" },
    { value: "pieces", label: "Pieces" },
    { value: "bags", label: "Bags" },
    { value: "boxes", label: "Boxes" },
    { value: "crates", label: "Crates" },
    { value: "bundles", label: "Bundles" },
];

