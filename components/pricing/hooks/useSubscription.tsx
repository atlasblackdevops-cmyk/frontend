"use client";

import { useState } from "react";
import {
    getPlans,
    createCheckoutSession,
    getCurrentSubscription,
    cancelSubscription,
    changePlan,
    type SubscriptionPlan,
    type CurrentSubscription,
} from "@/lib/subscription/api";
import { useAuth } from "@/stores/use-auth-store";

export function useSubscription() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkingOutPriceId, setCheckingOutPriceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { setIsSubscribed } = useAuth();

    /**
     * Fetch available subscription plans
     */
    const fetchPlans = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getPlans();
            const plansData = response?.data ?? [];
            setPlans(plansData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load plans";
            setError(errorMessage);
            console.error("Failed to fetch plans:", err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch current subscription
     */
    const fetchCurrentSubscription = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getCurrentSubscription();
            const subscriptionData = response?.data;
            setCurrentSubscription(subscriptionData);
            
            // Sync with auth store
            if (subscriptionData?.status === "ACTIVE") {
                setIsSubscribed(true);
            } else {
                setIsSubscribed(false);
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load subscription";
            setError(errorMessage);
            console.error("Failed to fetch current subscription:", err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Create checkout session and redirect to Stripe checkout
     */
    const checkout = async (priceId: string) => {
        setCheckingOutPriceId(priceId);
        setError(null);

        try {
            const response = await createCheckoutSession(priceId);
            const checkoutUrl = response?.data?.url;

            if (checkoutUrl) {
                // Redirect to Stripe checkout page
                window.location.href = checkoutUrl;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create checkout session";
            setError(errorMessage);
            console.error("Failed to create checkout:", err);
            setCheckingOutPriceId(null);
        }
        // Don't set checkingOutPriceId to null on success - page will redirect
    };

    /**
     * Cancel current subscription
     */
    const cancel = async (cancelAtPeriodEnd: boolean = true) => {
        setIsLoading(true);
        setError(null);

        try {
            await cancelSubscription(cancelAtPeriodEnd);
            // Update auth store if canceled immediately
            if (!cancelAtPeriodEnd) {
                setIsSubscribed(false);
            }
            // Refresh subscription data after cancellation
            await fetchCurrentSubscription();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to cancel subscription";
            setError(errorMessage);
            console.error("Failed to cancel subscription:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Change subscription plan
     */
    const changeSubscriptionPlan = async (newPriceId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await changePlan(newPriceId);
            // Refresh subscription data after plan change
            await fetchCurrentSubscription();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to change plan";
            setError(errorMessage);
            console.error("Failed to change plan:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        plans,
        currentSubscription,
        isLoading,
        checkingOutPriceId,
        error,
        fetchPlans,
        fetchCurrentSubscription,
        checkout,
        cancel,
        changeSubscriptionPlan,
    };
}
