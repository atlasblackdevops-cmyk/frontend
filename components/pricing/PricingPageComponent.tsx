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
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconTrendingUp,
    IconBuilding,
    IconLeaf,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import BaseButton from "../ui/BaseButton";

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingPlan {
    name: string;
    description: string;
    billingPeriod: "month" | "6months" | "1year";
    price: number;
    trialDays: number;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    badge?: string;
    features: PricingFeature[];
    ctaText: string;
    popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
    {
        name: "1 Month Plan",
        description: "Perfect for trying out our platform with flexibility",
        billingPeriod: "month",
        price: 29,
        trialDays: 7,
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
        ctaText: "Start 7-Day Trial",
    },
    {
        name: "6 Months Plan",
        description: "Great value for committed users with better savings",
        billingPeriod: "6months",
        price: 149,
        trialDays: 14,
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
        ctaText: "Start 14-Day Trial",
    },
    {
        name: "1 Year Plan",
        description: "Best value with maximum savings and full features",
        billingPeriod: "1year",
        price: 249,
        trialDays: 30,
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
        ctaText: "Start 30-Day Trial",
    },
];

export default function PricingPageComponent() {
    const router = useRouter();
    const theme = useMantineTheme();

    const getBillingPeriodLabel = (period: "month" | "6months" | "1year") => {
        switch (period) {
            case "month":
                return "per month";
            case "6months":
                return "per 6 months";
            case "1year":
                return "per year";
        }
    };

    const calculateMonthlyEquivalent = (price: number, period: "month" | "6months" | "1year") => {
        switch (period) {
            case "month":
                return price;
            case "6months":
                return Math.round(price / 6);
            case "1year":
                return Math.round(price / 12);
        }
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

                {/* Pricing Cards */}
                <Grid gutter={{ base: "md", md: "xl" }} w="100%">
                    {pricingPlans.map((plan) => {
                        const Icon = plan.icon;
                        const isPopular = plan.popular;
                        const period = getBillingPeriodLabel(plan.billingPeriod);
                        const monthlyEquivalent = calculateMonthlyEquivalent(plan.price, plan.billingPeriod);
                        const displayPrice = `$${plan.price}`;
                       

                        return (
                            <Grid.Col
                                key={plan.name}
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
                                        {isPopular && (
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
                                                    {plan.badge}
                                                </Badge>
                                            </Box>
                                        )}

                                        <Stack gap="lg" style={{ flex: 1}}>
                                            {/* Plan Header */}
                                            <Stack gap="xs">
                                                <ThemeIcon
                                                    size={56}
                                                    radius="md"
                                                    color={plan.color}
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
                                                    {plan.description}
                                                </Text>
                                            </Stack>

                                            {/* Pricing */}
                                            <Box style={{ marginTop: 6, marginBottom: 8 }}>
                                                <Group gap={4} align="baseline" wrap="nowrap">
                                                    <Text
                                                        size="48px"
                                                        fw={700}
                                                        c={isPopular ? theme.colors.brandGreen[6]: theme.colors.dark[7]}
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
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        }}
                                                    >
                                                        {period}  
                                                    </Text>
                                                    <Text 
                                                        size="xs" 
                                                        c="dimmed" 
                                                        fw={500}
                                                        style={{
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        }}
                                                    >
                                                      {monthlyEquivalent !== plan.price && `(${monthlyEquivalent}/month)`} 
                                                    </Text>
                                                </Group>
                                               
                                            </Box>

                                            {/* CTA Button */}
                                            <BaseButton
                                                fullWidth
                                                variant={isPopular ? "filled" : "outline"}
                                                color="brandGreen"
                                                radius="xl"
                                                style={{ marginTop: "auto" }}
                                                onClick={() => {
                                                    router.push("/register");
                                                }}
                                            >
                                                {plan.ctaText}
                                            </BaseButton>

                                            {/* Features List */}
                                            <List
                                                spacing="sm"
                                                size="sm"
                                                style={{ flex: 1 }}
                                            >
                                            {plan.features.map((feature, index) => (
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
                                                                <IconX size={12} strokeWidth={3} />
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

                </Stack>
            </Container>
        </>
    );
}
