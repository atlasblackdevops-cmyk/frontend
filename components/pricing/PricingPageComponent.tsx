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
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconTrendingUp,
    IconBuilding,
    IconLeaf,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import { useEffect } from "react";
import BaseButton from "../ui/BaseButton";
import { useSubscription } from "./hooks/useSubscription";
import type { SubscriptionPlan } from "@/lib/subscription/api";

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
            { text: "Up to 5 fields", included: true },
            { text: "Up to 20 animals", included: true },
            { text: "Basic crop tracking", included: true },
            { text: "Financial reports", included: true },
            { text: "Mobile app access", included: true },
            { text: "Email support", included: true },
            { text: "Advanced analytics", included: false },
            { text: "AI-powered insights", included: false },
            { text: "Multi-user access", included: false },
            { text: "Priority support", included: false },
        ],
    },
    "6months": {
        description: "Great value for committed users with better savings",
        icon: IconTrendingUp,
        color: "brandGreen",
        badge: "Most Popular",
        popular: true,
        features: [
            { text: "Unlimited fields", included: true },
            { text: "Unlimited animals", included: true },
            { text: "Advanced crop tracking", included: true },
            { text: "Comprehensive financial reports", included: true },
            { text: "Mobile app access", included: true },
            { text: "Priority email support", included: true },
            { text: "Advanced analytics", included: true },
            { text: "AI-powered insights", included: true },
            { text: "Up to 5 users", included: true },
            { text: "API access", included: false },
            { text: "24/7 phone support", included: false },
        ],
    },
    year: {
        description: "Best value with maximum savings and full features",
        icon: IconBuilding,
        color: "brandGreen",
        features: [
            { text: "Unlimited everything", included: true },
            { text: "All 6-month features", included: true },
            { text: "Unlimited users", included: true },
            { text: "Custom integrations", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "24/7 priority support", included: true },
            { text: "Advanced analytics", included: true },
            { text: "AI-powered insights", included: true },
            { text: "API access", included: true },
            { text: "White-label option", included: true },
        ],
    },
};

export default function PricingPageComponent() {
    const router = useRouter();
    const theme = useMantineTheme();
    const { plans, isLoading, checkingOutPriceId, error, fetchPlans, checkout } = useSubscription();

    useEffect(() => {
        fetchPlans();
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

    const handleCheckout = async (priceId: string) => {
        await checkout(priceId);
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
            <Container size="xl" py={{ base: "xl", md: "3rem" }}>
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
                        Pricing Plans
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
                        Choose the Right Plan for Your Farm
                    </Title>
                    <Text size="md" c="dimmed" mb="md" maw={600}>
                        Choose from our flexible billing options: 1 month, 6 months, or 1 year.
                        Start your free trial today. No hidden fees.
                    </Text>
                </Stack>

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

                {/* Loading State */}
                {isLoading && (
                    <Box style={{ textAlign: "center", padding: "3rem" }}>
                        <Loader size="lg" color="brandGreen" />
                        <Text size="sm" c="dimmed" mt="md">
                            Loading pricing plans...
                        </Text>
                    </Box>
                )}

                {/* Pricing Cards */}
                {!isLoading && plans.length > 0 && (
                    <Grid gutter={{ base: "md", md: "xl" }} w="100%">
                        {plans.map((plan) => {
                            const metadata = getPlanMetadata(plan.interval, plan.intervalCount);
                            const Icon = metadata.icon;
                            const isPopular = metadata.popular;
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
                                                borderWidth: isPopular ? 2 : 1,
                                                borderColor: isPopular
                                                    ? theme.colors.brandGreen[5]
                                                    : theme.colors.gray[3],
                                                backgroundColor: isPopular
                                                    ? theme.colors.brandGreen[0]
                                                    : theme.white,
                                                boxShadow: isPopular
                                                    ? `0 6px 22px ${theme.colors.brandGreen[2]}`
                                                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                height: "100%",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = isPopular
                                                    ? `0 12px 32px ${theme.colors.brandGreen[3]}`
                                                    : "0 8px 24px rgba(0, 0, 0, 0.12)";
                                                e.currentTarget.style.transform = "translateY(-4px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = isPopular
                                                    ? `0 6px 22px ${theme.colors.brandGreen[2]}`
                                                    : "0 2px 8px rgba(0, 0, 0, 0.05)";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            {isPopular && metadata.badge && (
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
                                                                isPopular
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
                                                <BaseButton
                                                    fullWidth
                                                    variant={isPopular ? "filled" : "outline"}
                                                    color="brandGreen"
                                                    radius="xl"
                                                    loading={checkingOutPriceId === plan.priceId}
                                                    disabled={checkingOutPriceId !== null && checkingOutPriceId !== plan.priceId}
                                                    onClick={() => handleCheckout(plan.priceId)}
                                                >
                                                    Subscribe Now
                                                </BaseButton>

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
                )}

                {/* No Plans Available */}
                {!isLoading && plans.length === 0 && !error && (
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
