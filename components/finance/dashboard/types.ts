// Dashboard Summary Types
export type DashboardSummary = {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    period: string;
    currency: string;
};

export type TopMetrics = {
    highestRevenueDay: {
        date: string;
        amount: number;
    };
    highestExpenseDay: {
        date: string;
        amount: number;
    };
    averageDailyProfit: number;
};

export type DashboardSummaryResponse = {
    summary: DashboardSummary;
    topMetrics: TopMetrics | null;
};

// Dashboard Trends Types
export type TrendDataPoint = {
    period: string;
    label: string;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
};

export type TrendsSummary = {
    totalPeriods: number;
    averageRevenue: number;
    averageExpenses: number;
    averageProfit: number;
};

export type DashboardTrendsResponse = {
    trends: TrendDataPoint[];
    summary: TrendsSummary;
};

// Dashboard Breakdown Types
export type ExpenseCategory = {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
};

export type TopVendor = {
    vendor: string;
    totalAmount: number;
    transactionCount: number;
};

export type TopBuyer = {
    buyerName: string;
    totalAmount: number;
    transactionCount: number;
};

export type RevenueByProduct = {
    productSold: string;
    totalAmount: number;
    totalQuantity: number;
    unit: string;
};

export type PaymentMethodData = {
    method: string;
    totalAmount: number;
    count: number;
};

export type PaymentMethods = {
    expenses: PaymentMethodData[];
    revenues: PaymentMethodData[];
};

export type RecentExpense = {
    id: string;
    expenseDate: string;
    amount: number;
    vendor: string | null;
    category: {
        id: string;
        categoryName: string;
    } | null;
    otherCategoryName: string | null;
};

export type RecentRevenue = {
    id: string;
    revenueDate: string;
    amount: number;
    buyerName: string | null;
    productSold: string | null;
};

export type RecentTransactions = {
    expenses: RecentExpense[];
    revenues: RecentRevenue[];
};

export type DashboardBreakdownResponse = {
    expenseCategories: ExpenseCategory[];
    topVendors: TopVendor[];
    topBuyers: TopBuyer[];
    revenueByProduct: RevenueByProduct[];
    paymentMethods: PaymentMethods;
    recentTransactions: RecentTransactions;
};

// API Request Types
export type GetDashboardSummaryParams = {
    dateFrom?: string;
    dateTo?: string;
    currency?: string;
    period?: "daily" | "weekly" | "monthly" | "yearly";
};

export type GetDashboardTrendsParams = {
    dateFrom: string;
    dateTo: string;
    groupBy: "day" | "week" | "month" | "year";
    currency?: string;
};

export type GetDashboardBreakdownParams = {
    dateFrom?: string;
    dateTo?: string;
    type?: "all" | "expense-categories" | "top-vendors" | "top-buyers" | "revenue-by-product" | "payment-methods" | "recent-transactions";
    limit?: number;
    currency?: string;
};

