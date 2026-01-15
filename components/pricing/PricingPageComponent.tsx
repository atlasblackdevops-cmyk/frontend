"use client";

import {
    Container,
    Title,
    Text,
    Stack,
    Grid,
    Card,
    Badge,
    Group,
    List,
    ThemeIcon,
    Box,
    Loader,
    Alert,
    LoadingOverlay,
    Modal,
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconTrendingUp,
    IconBuilding,
    IconLeaf,
    IconAlertCircle,
    IconArrowRight,
    IconArrowLeft,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/stores/use-auth-store";
import { useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import BaseButton from "../ui/BaseButton";
import { useSubscription } from "./hooks/useSubscription";
import type { SubscriptionPlan, CurrentSubscription } from "@/lib/subscription/api";

interface PricingPageComponentProps {
    mode?: "subscribe" | "change-plan";
}

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PlanUIMetadata {
    description: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    badge?: string;
    features: PricingFeature[];
    popular?: boolean;
}

// UI metadata for different plan types
const planUIMetadata: Record<string, PlanUIMetadata> = {
    month: {
        description: "Perfect for trying out our platform with flexibility",
        icon: IconLeaf,
        color: "brandGreen",
        features: [
            // { text: "Up to 5 fields", included: true },
            // { text: "Up to 20 animals", included: true },
            // { text: "Basic crop tracking", included: true },
            // { text: "Financial reports", included: true },
            // { text: "Mobile app access", included: true },
            // { text: "Email support", included: true },
            // { text: "Advanced analytics", included: false },
            // { text: "AI-powered insights", included: false },
            // { text: "Multi-user access", included: false },
            // { text: "Priority support", included: false },
        ],
    },
    "6months": {
        description: "Great value for committed users with better savings",
        icon: IconTrendingUp,
        color: "brandGreen",
        badge: "Most Popular",
        popular: true,
        features: [
            // { text: "Unlimited fields", included: true },
            // { text: "Unlimited animals", included: true },
            // { text: "Advanced crop tracking", included: true },
            // { text: "Comprehensive financial reports", included: true },
            // { text: "Mobile app access", included: true },
            // { text: "Priority email support", included: true },
            // { text: "Advanced analytics", included: true },
            // { text: "AI-powered insights", included: true },
            // { text: "Up to 5 users", included: true },
            // { text: "API access", included: false },
            // { text: "24/7 phone support", included: false },
        ],
    },
    year: {
        description: "Best value with maximum savings and full features",
        icon: IconBuilding,
        color: "brandGreen",
        features: [
            // { text: "Unlimited everything", included: true },
            // { text: "All 6-month features", included: true },
            // { text: "Unlimited users", included: true },
            // { text: "Custom integrations", included: true },
            // { text: "Dedicated account manager", included: true },
            // { text: "24/7 priority support", included: true },
            // { text: "Advanced analytics", included: true },
            // { text: "AI-powered insights", included: true },
            // { text: "API access", included: true },
            // { text: "White-label option", included: true },
        ],
    },
};

export default function PricingPageComponent({ mode = "subscribe" }: PricingPageComponentProps) {
    const router = useRouter();
    const theme = useMantineTheme();
    const {
        plans,
        currentSubscription,
        isLoading,
        checkingOutPriceId,
        error,
        fetchPlans,
        fetchCurrentSubscription,
        checkout,
        changeSubscriptionPlan,
    } = useSubscription();
    const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const isChangePlanMode = mode === "change-plan";
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
    const { status } = useSession();
    const { token } = useAuth();

    const isLoggedIn = status === "authenticated" || !!token;

    const handleBack = async () => {
        if (isLoggedIn && currentSubscription?.status === "ACTIVE") {
            router.push("/dashboard");
        } else if (isLoggedIn) {
            // If logged in but not active, sign out to allow returning to login
            await signOut({ callbackUrl: "/login" });
        } else {
            router.push("/login");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchPlans();
            await fetchCurrentSubscription();
            setHasAttemptedFetch(true);
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getBillingPeriodLabel = (interval: string, intervalCount: number = 1) => {
        if (intervalCount === 1) {
            return `per ${interval}`;
        }
        return `per ${intervalCount} ${interval}s`;
    };

    const calculateMonthlyEquivalent = (amount: number, interval: string, intervalCount: number = 1) => {
        const totalMonths = interval === "year" ? intervalCount * 12 : 
                          interval === "month" ? intervalCount : 
                          interval === "day" ? intervalCount / 30 : intervalCount;
        return Math.round(amount / totalMonths);
    };

    const getPlanMetadata = (interval: string, intervalCount: number = 1): PlanUIMetadata => {
        if (interval === "month" && intervalCount === 1) {
            return planUIMetadata.month;
        }
        if (interval === "month" && intervalCount === 6) {
            return planUIMetadata["6months"];
        }
        if (interval === "year") {
            return planUIMetadata.year;
        }
        // Fallback to month plan metadata
        return planUIMetadata.month;
    };

    const getCurrentPlanName = (subscription: CurrentSubscription | null, plans: SubscriptionPlan[]): string | null => {
        if (!subscription?.stripePriceId) return null;
        const currentPlan = plans.find((p) => p.priceId === subscription.stripePriceId);
        return currentPlan?.name || null;
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const handleCheckout = async (priceId: string) => {
        // If user already has a subscription, redirect to change-plan instead
        if (currentSubscription && currentSubscription.status === "ACTIVE") {
            router.push("/subscription/change-plan");
            return;
        }
        await checkout(priceId);
    };

    const handleChangePlan = async (priceId: string) => {
        if (!currentSubscription) return;

        // Don't allow changing to the same plan
        if (currentSubscription.stripePriceId === priceId) {
            return;
        }

        setChangingPlanId(priceId);
        setSuccess(null);

        try {
            await changeSubscriptionPlan(priceId);
            setSuccessModalOpen(true);
            // Refresh subscription data in background
            await fetchCurrentSubscription();
        } catch (err: any) {
            console.error("Failed to change plan:", err);
        } finally {
            setChangingPlanId(null);
        }
    };

    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
        router.push("/dashboard");
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <Container size="xl" py={{ base: "xl", md: "3rem" }} style={{ position: 'relative', minHeight: '400px' }}>
                <LoadingOverlay 
                    visible={isLoading && plans.length === 0} 
                    zIndex={1000} 
                    overlayProps={{ radius: "sm", blur: 2 }} 
                />
                
                {/* Back Button */}
                <Box style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                    <BaseButton
                        variant="subtle"
                        color="gray"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={handleBack}
                    >
                        Back
                    </BaseButton>
                </Box>

                <Stack gap="xl" align="center">
                {/* Header Section */}
                <Stack gap="md" align="center" maw={800} ta="center">
                    <Badge
                        size="lg"
                        variant="light"
                        color="brandGreen"
                        radius="xl"
                        px="md"
                        py={4}
                    >
                        {isChangePlanMode ? "Change Plan" : "Pricing Plans"}
                    </Badge>
                    <Title
                        order={1}
                        fw={700}
                        style={{
                            background: `linear-gradient(135deg, ${theme.colors.brandGreen[6]} 0%, ${theme.colors.brandOrange[6]} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontSize: "2.5rem",
                        }}
                    >
                        {isChangePlanMode
                            ? "Change Your Subscription Plan"
                            : "Choose the Right Plan for Your Farm"}
                    </Title>
                    <Text size="md" c="dimmed" mb="md" maw={600}>
                        {isChangePlanMode
                            ? "Select a new plan below. Changes will take effect at the end of your current billing period."
                            : "Choose from our flexible billing options: 1 month, 6 months, or 1 year. Start your free trial today. No hidden fees."}
                    </Text>
                </Stack>

                {/* Current Subscription Card (Change Plan Mode Only) */}
                {isChangePlanMode && currentSubscription && (
                    <Card
                        p="lg"
                        radius="lg"
                        withBorder
                        style={{
                            borderColor: theme.colors.brandGreen[4],
                            backgroundColor: theme.colors.brandGreen[0],
                            borderWidth: 2,
                            width: "100%",
                        }}
                    >
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap="xs">
                                    <Group gap="sm">
                                        <Text fw={600} size="lg">
                                            Current Plan
                                        </Text>
                                        {currentSubscription.status === "ACTIVE" && (
                                            <Badge color="brandGreen" variant="light">
                                                Active
                                            </Badge>
                                        )}
                                        {currentSubscription.cancelAtPeriodEnd && (
                                            <Badge color="orange" variant="light">
                                                Canceling at Period End
                                            </Badge>
                                        )}
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        {getCurrentPlanName(currentSubscription, plans) || "Unknown Plan"}
                                    </Text>
                                    {currentSubscription.currentPeriodEnd && (
                                        <Text size="xs" c="dimmed">
                                            Current period ends: {formatDate(currentSubscription.currentPeriodEnd)}
                                        </Text>
                                    )}
                                </Stack>
                            </Group>
                        </Stack>
                    </Card>
                )}

                {/* Success Alert (Change Plan Mode Only) */}
                {isChangePlanMode && success && (
                    <Alert
                        icon={<IconCheck size={16} />}
                        title="Success"
                        color="green"
                        variant="light"
                        onClose={() => setSuccess(null)}
                        withCloseButton
                        w="100%"
                    >
                        {success}
                    </Alert>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Error"
                        color="red"
                        variant="light"
                        w="100%"
                    >
                        {error}
                    </Alert>
                )}

                {/* Success Modal */}
                <Modal
                    opened={successModalOpen}
                    onClose={handleSuccessModalClose}
                    title="Plan Change Successful"
                    centered
                    radius="md"
                    withCloseButton={false}
                >
                    <Stack align="center" py="md">
                        <ThemeIcon size={60} radius="xl" color="green" variant="light">
                            <IconCheck size={35} />
                        </ThemeIcon>
                        <Title order={3}>Request Submitted!</Title>
                        <Text ta="center" size="sm" c="dimmed">
                            Your request to change your plan has been successfully received. 
                            Your subscription will be updated at the end of the current billing period.
                        </Text>
                        <BaseButton fullWidth mt="md" onClick={handleSuccessModalClose}>
                            Go to Dashboard
                        </BaseButton>
                    </Stack>
                </Modal>

                {/* Pricing Cards */}
                {plans.length > 0 && (
                    <>
                        {isChangePlanMode && (
                            <Title order={2} size="h3" ta="center" fw={600} w="100%">
                                Available Plans
                            </Title>
                        )}
                        <Grid gutter={{ base: "md", md: "xl" }} w="100%">
                            {plans.map((plan) => {
                                const metadata = getPlanMetadata(plan.interval, plan.intervalCount);
                                const Icon = metadata.icon;
                                const isPopular = metadata.popular;
                                const isCurrentPlan = currentSubscription?.stripePriceId === plan.priceId && currentSubscription.status === "ACTIVE";
                                const period = getBillingPeriodLabel(plan.interval, plan.intervalCount);
                            const monthlyEquivalent = calculateMonthlyEquivalent(
                                plan.amount / 100,
                                plan.interval,
                                plan.intervalCount
                            );
                            const displayPrice = `$${(plan.amount / 100).toFixed(0)}`;

                            return (
                                <Grid.Col
                                    key={plan.priceId}
                                    span={{ base: 12, md: 4 }}
                                    style={{ display: "flex" }}
                                >
                                    <Box
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                            height: "100%",
                                        }}
                                    >
                                        <Card
                                            p={{ base: "lg", md: "xl" }}
                                            radius="lg"
                                            withBorder
                                            style={{
                                                flex: 1,
                                                position: "relative",
                                                display: "flex",
                                                flexDirection: "column",
                                                borderWidth: isCurrentPlan || (isPopular && !isChangePlanMode) ? 2 : 1,
                                                borderColor:
                                                    isCurrentPlan
                                                        ? theme.colors.brandGreen[6]
                                                        : isPopular && !isChangePlanMode
                                                          ? theme.colors.brandGreen[5]
                                                          : theme.colors.gray[3],
                                                backgroundColor:
                                                    isCurrentPlan
                                                        ? theme.colors.brandGreen[1]
                                                        : isPopular && !isChangePlanMode
                                                          ? theme.colors.brandGreen[0]
                                                          : theme.white,
                                                boxShadow:
                                                    isCurrentPlan || (isPopular && !isChangePlanMode)
                                                        ? `0 6px 22px ${theme.colors.brandGreen[2]}`
                                                        : "0 2px 8px rgba(0, 0, 0, 0.05)",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                height: "100%",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isCurrentPlan) {
                                                    const useHighlightShadow = isPopular && !isChangePlanMode;
                                                    e.currentTarget.style.boxShadow =
                                                        useHighlightShadow
                                                            ? `0 12px 32px ${theme.colors.brandGreen[3]}`
                                                            : "0 8px 24px rgba(0, 0, 0, 0.12)";
                                                    e.currentTarget.style.transform = "translateY(-4px)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isCurrentPlan) {
                                                    const useHighlightShadow = isPopular && !isChangePlanMode;
                                                    e.currentTarget.style.boxShadow =
                                                        isCurrentPlan || useHighlightShadow
                                                            ? `0 6px 22px ${theme.colors.brandGreen[2]}`
                                                            : "0 2px 8px rgba(0, 0, 0, 0.05)";
                                                    e.currentTarget.style.transform = "translateY(0)";
                                                }
                                            }}
                                        >
                                            {isPopular && metadata.badge && !isCurrentPlan && !isChangePlanMode && (
                                                <Box
                                                    style={{
                                                        position: "absolute",
                                                        top: 12,
                                                        right: 10,
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <Badge
                                                        size="lg"
                                                        color="brandGreen"
                                                        variant="filled"
                                                        radius="xl"
                                                        style={{
                                                            fontWeight: 700,
                                                            padding: "6px 20px",
                                                            fontSize: "12px",
                                                            letterSpacing: "0.5px",
                                                        }}
                                                    >
                                                        {metadata.badge}
                                                    </Badge>
                                                </Box>
                                            )}

                                            {isCurrentPlan && (
                                                <Box
                                                    style={{
                                                        position: "absolute",
                                                        top: 12,
                                                        right: 10,
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <Badge
                                                        size="lg"
                                                        color="brandGreen"
                                                        variant="filled"
                                                        radius="xl"
                                                        style={{
                                                            fontWeight: 700,
                                                            padding: "6px 20px",
                                                            fontSize: "12px",
                                                            letterSpacing: "0.5px",
                                                        }}
                                                    >
                                                        Current Plan
                                                    </Badge>
                                                </Box>
                                            )}

                                            <Stack gap="lg" style={{ flex: 1 }}>
                                                {/* Plan Header */}
                                                <Stack gap="xs">
                                                    <ThemeIcon
                                                        size={56}
                                                        radius="md"
                                                        color={metadata.color}
                                                        variant="light"
                                                        style={{
                                                            alignSelf: "flex-start",
                                                        }}
                                                    >
                                                        <Icon size={28} />
                                                    </ThemeIcon>
                                                    <Title order={3} size="h3" fw={700} style={{ marginTop: 8 }}>
                                                        {plan.name}
                                                    </Title>
                                                    <Text size="sm" c="dimmed" style={{ minHeight: 30 }}>
                                                        {metadata.description}
                                                    </Text>
                                                </Stack>

                                                {/* Pricing */}
                                                <Box style={{ marginTop: 6, marginBottom: 8 }}>
                                                    <Group gap={4} align="baseline" wrap="nowrap">
                                                        <Text
                                                            size="48px"
                                                            fw={700}
                                                            c={
                                                                isCurrentPlan || (isPopular && !isChangePlanMode)
                                                                    ? theme.colors.brandGreen[6]
                                                                    : theme.colors.dark[7]
                                                            }
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {displayPrice}
                                                        </Text>
                                                        <Text
                                                            size="sm"
                                                            c="dimmed"
                                                            fw={500}
                                                            style={{
                                                                transition:
                                                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            }}
                                                        >
                                                            {period}
                                                        </Text>
                                                        {monthlyEquivalent !== plan.amount / 100 && (
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                                fw={500}
                                                                style={{
                                                                    transition:
                                                                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                }}
                                                            >
                                                                ($
                                                                {monthlyEquivalent}
                                                                /month)
                                                            </Text>
                                                        )}
                                                    </Group>
                                                </Box>

                                                {/* CTA Button */}
                                                {isCurrentPlan ? (
                                                    <BaseButton
                                                        fullWidth
                                                        variant="outline"
                                                        color="brandGreen"
                                                        radius="xl"
                                                        disabled
                                                    >
                                                        Current Plan
                                                    </BaseButton>
                                                ) : isChangePlanMode ? (
                                                    <BaseButton
                                                        fullWidth
                                                        variant={isPopular && !isChangePlanMode ? "filled" : "outline"}
                                                        color="brandGreen"
                                                        radius="xl"
                                                        loading={changingPlanId === plan.priceId}
                                                        disabled={
                                                            (changingPlanId !== null &&
                                                                changingPlanId !== plan.priceId) ||
                                                            isLoading
                                                        }
                                                        rightSection={<IconArrowRight size={18} />}
                                                        onClick={() => handleChangePlan(plan.priceId)}
                                                    >
                                                        Switch to This Plan
                                                    </BaseButton>
                                                ) : (
                                                    <BaseButton
                                                        fullWidth
                                                        variant={isPopular ? "filled" : "outline"}
                                                        color="brandGreen"
                                                        radius="xl"
                                                        loading={checkingOutPriceId === plan.priceId}
                                                        disabled={
                                                            checkingOutPriceId !== null && checkingOutPriceId !== plan.priceId
                                                        }
                                                        onClick={() => handleCheckout(plan.priceId)}
                                                    >
                                                        Subscribe Now
                                                    </BaseButton>
                                                )}

                                                {/* Features List */}
                                                <List spacing="sm" size="sm" style={{ flex: 1 }}>
                                                    {metadata.features.map((feature, index) => (
                                                        <List.Item
                                                            key={index}
                                                            style={{
                                                                opacity: feature.included ? 1 : 0.5,
                                                            }}
                                                        >
                                                            <Group gap="xs" wrap="nowrap">
                                                                {feature.included ? (
                                                                    <ThemeIcon
                                                                        color="brandGreen"
                                                                        size={18}
                                                                        radius="xl"
                                                                        variant="light"
                                                                        style={{ flexShrink: 0 }}
                                                                    >
                                                                        <IconCheck
                                                                            size={12}
                                                                            strokeWidth={3}
                                                                        />
                                                                    </ThemeIcon>
                                                                ) : (
                                                                    <ThemeIcon
                                                                        color="gray"
                                                                        size={18}
                                                                        radius="xl"
                                                                        variant="light"
                                                                        style={{ flexShrink: 0 }}
                                                                    >
                                                                        <IconX
                                                                            size={12}
                                                                            strokeWidth={3}
                                                                        />
                                                                    </ThemeIcon>
                                                                )}
                                                                <Text
                                                                    size="sm"
                                                                    style={{
                                                                        textDecoration: feature.included
                                                                            ? "none"
                                                                            : "line-through",
                                                                    }}
                                                                >
                                                                    {feature.text}
                                                                </Text>
                                                            </Group>
                                                        </List.Item>
                                                    ))}
                                                </List>
                                            </Stack>
                                        </Card>
                                    </Box>
                                </Grid.Col>
                            );
                        })}
                        </Grid>
                    </>
                )}

                 {/* No Plans Available */}
                {hasAttemptedFetch && plans.length === 0 && !error && (
                    <Box style={{ textAlign: "center", padding: "3rem" }}>
                        <Text size="lg" c="dimmed">
                            No pricing plans available at the moment.
                        </Text>
                    </Box>
                )}

                </Stack>
            </Container>
        </>
    );
}
