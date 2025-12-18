import { api } from "@/lib/api";

/**
 * Subscription plan from Stripe
 */
export interface SubscriptionPlan {
    priceId: string;
    productId: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
    intervalCount: number;
    description: string | null;
    metadata: Record<string, string>;
}

/**
 * Plans API Response
 */
export interface PlansApiResponse {
    data: SubscriptionPlan[];
}

/**
 * Checkout session response
 */
export interface CheckoutSessionResponse {
    message: string;
    data: {
        url: string;
        id: string;
    };
}

/**
 * Current subscription status
 */
export type SubscriptionStatus = 
    | "ACTIVE" 
    | "CANCELED" 
    | "PAST_DUE" 
    | "UNPAID" 
    | "TRIALING" 
    | "INCOMPLETE" 
    | "INCOMPLETE_EXPIRED"
    | "NONE";

/**
 * Current subscription data
 */
export interface CurrentSubscription {
    id?: string;
    ownerGroupId?: string;
    stripePriceId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    status: SubscriptionStatus;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string | null;
    trialStart?: string | null;
    trialEnd?: string | null;
    createdAt?: string | null;
}

/**
 * Current subscription API response
 */
export interface CurrentSubscriptionResponse {
    data: CurrentSubscription;
}

/**
 * Get available subscription plans from Stripe
 */
export async function getPlans(): Promise<PlansApiResponse> {
    const response = await api.get<PlansApiResponse>("/api/v1/subscription/plans");
    return response.data;
}

/**
 * Create a checkout session for a specific plan
 */
export async function createCheckoutSession(
    priceId: string
): Promise<CheckoutSessionResponse> {
    const response = await api.post<CheckoutSessionResponse>(
        "/api/v1/subscription/checkout",
        { priceId }
    );
    return response.data;
}

/**
 * Get current user's subscription
 */
export async function getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const response = await api.get<CurrentSubscriptionResponse>(
        "/api/v1/subscription/current"
    );
    return response.data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
    cancelAtPeriodEnd: boolean = true
): Promise<{ message: string; data: any }> {
    const response = await api.post("/api/v1/subscription/cancel", {
        cancelAtPeriodEnd,
    });
    return response.data;
}

/**
 * Change subscription plan
 */
export async function changePlan(
    newPriceId: string
): Promise<{ message: string; data: any }> {
    const response = await api.post("/api/v1/subscription/change-plan", {
        newPriceId,
    });
    return response.data;
}
