"use client";

import {
    Container,
    Title,
    Text,
    Stack,
    Card,
    ThemeIcon,
    Box,
    List,
    Badge,
    Loader,
    Group,
} from "@mantine/core";
import {
    IconCheck,
    IconReceipt,
    IconMail,
    IconCalendar,
    IconCreditCard,
    IconInfoCircle,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import BaseButton from "@/components/ui/BaseButton";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import styles from "./PaymentResult.module.css";

type SubscriptionStatus = 
    | "ACTIVE" 
    | "CANCELED" 
    | "PAST_DUE" 
    | "UNPAID" 
    | "TRIALING" 
    | "INCOMPLETE" 
    | "INCOMPLETE_EXPIRED"
    | "NONE";

interface SubscriptionData {
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

export default function PaymentSuccessComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useMantineTheme();
    const { setIsSubscribed } = useAuth();

    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get payment details from URL params if available
    const sessionId = searchParams.get("session_id") || "N/A";

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/v1/subscription/current");
                const data = response.data?.data;
                setSubscription(data);
                setError(null);
                
                // Update subscription status in auth store
                if (data && (data.status === "ACTIVE" || data.status === "TRIALING")) {
                    setIsSubscribed(true);
                }
            } catch (err: any) {
                console.error("Failed to fetch subscription:", err);
                setError(err?.response?.data?.message || "Failed to load subscription details");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [setIsSubscribed]);

    return (
        <Container size="sm" py={{ base: "xl", md: "4rem" }}>
            <Stack gap="xl" align="center">
                {/* Success Icon */}
                <Box className={styles.successIcon}>
                        <ThemeIcon
                            size={80}
                            radius="50%"
                            color="brandGreen"
                            // variant="light"
                            style={{
                                boxShadow: `0 8px 32px ${theme.colors.brandGreen[2]}`,
                            }}
                        >
                            <IconCheck size={45} strokeWidth={2.5} />
                        </ThemeIcon>
                    </Box>

                    {/* Success Message */}
                    <Stack gap="sm" align="center" ta="center" className={styles.slideUp}>
                        <Title
                            order={1}
                            fw={700}
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors.brandGreen[6]} 0%, ${theme.colors.brandGreen[8]} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontSize: "2.5rem",
                            }}
                        >
                            Payment Successful!
                        </Title>
                        <Text size="md" c="dimmed" maw={400}>
                            Thank you for your subscription. Your payment has been processed successfully.
                        </Text>
                    </Stack>

                    {/* Subscription Details Card */}
                    <Card
                        w="100%"
                        p="xl"
                        radius="lg"
                        withBorder
                        className={styles.slideUp}
                        style={{
                            borderColor: theme.colors.brandGreen[2],
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        <Stack gap="lg">
                            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Text size="lg" fw={600} c={theme.colors.brandGreen[7]}>
                                    Subscription Details
                                </Text>
                                {loading && <Loader size="sm" color="brandGreen" />}
                            </Box>

                            {error && (
                                <Box
                                    p="md"
                                    style={{
                                        backgroundColor: theme.colors.red[0],
                                        borderRadius: theme.radius.md,
                                        border: `1px solid ${theme.colors.red[2]}`,
                                    }}
                                >
                                    <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <IconInfoCircle size={16} color={theme.colors.red[6]} />
                                        <Text size="sm" c="red.7">
                                            {error}
                                        </Text>
                                    </Box>
                                </Box>
                            )}

                            {!loading && subscription && (
                                <>
                                    <List spacing="md" size="md" icon={<></>}>
                                        <List.Item>
                                            <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <ThemeIcon
                                                    size={36}
                                                    radius="md"
                                                    color="brandGreen"
                                                    variant="light"
                                                >
                                                    <IconCreditCard size={20} />
                                                </ThemeIcon>
                                                <Box style={{ flex: 1 }}>
                                                    <Text size="xs" c="dimmed" fw={500}>
                                                        Subscription Status
                                                    </Text>
                                                    <Box style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                                        <Badge
                                                            color={
                                                                subscription.status === "ACTIVE" || subscription.status === "TRIALING"
                                                                    ? "green"
                                                                    : subscription.status === "PAST_DUE"
                                                                    ? "yellow"
                                                                    : "red"
                                                            }
                                                            variant="filled"
                                                            size="sm"
                                                        >
                                                            {subscription.status}
                                                        </Badge>
                                                        {subscription.status === "TRIALING" && subscription.trialEnd && (
                                                            <Text size="xs" c="dimmed">
                                                                (Trial ends {new Date(subscription.trialEnd).toLocaleDateString()})
                                                            </Text>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </List.Item>

                                        {subscription.currentPeriodStart && (
                                            <List.Item>
                                                <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <ThemeIcon
                                                        size={36}
                                                        radius="md"
                                                        color="brandGreen"
                                                        variant="light"
                                                    >
                                                        <IconCalendar size={20} />
                                                    </ThemeIcon>
                                                    <Box>
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            Billing Period Start
                                                        </Text>
                                                        <Text size="md" fw={600}>
                                                            {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            </List.Item>
                                        )}

                                        {subscription.currentPeriodEnd && (
                                            <List.Item>
                                                <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <ThemeIcon
                                                        size={36}
                                                        radius="md"
                                                        color="brandGreen"
                                                        variant="light"
                                                    >
                                                        <IconCalendar size={20} />
                                                    </ThemeIcon>
                                                    <Box>
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            {subscription.cancelAtPeriodEnd ? "Subscription Ends On" : "Next Billing Date"}
                                                        </Text>
                                                        <Text size="md" fw={600}>
                                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            </List.Item>
                                        )}

                                        
                                    </List>

                                    {subscription.cancelAtPeriodEnd && (
                                        <Box
                                            p="md"
                                            style={{
                                                backgroundColor: theme.colors.yellow[0],
                                                borderRadius: theme.radius.md,
                                                border: `1px solid ${theme.colors.yellow[2]}`,
                                            }}
                                        >
                                            <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <IconInfoCircle size={16} color={theme.colors.yellow[7]} />
                                                <Text size="sm" c="yellow.8" fw={500}>
                                                    Your subscription will cancel at the end of the current billing period.
                                                </Text>
                                            </Box>
                                        </Box>
                                    )}

                                    {(sessionId !== "N/A" || subscription.stripeSubscriptionId) && (
                                        <Box
                                            p="md"
                                            style={{
                                                backgroundColor: theme.white,
                                                borderRadius: theme.radius.md,
                                                border: `1px solid ${theme.colors.gray[2]}`,
                                            }}
                                        >
                                            {sessionId !== "N/A" && (
                                                <Box mb={subscription.stripeSubscriptionId ? "sm" : 0}>
                                                    <Text size="xs" c="dimmed" mb={4}>
                                                        Session ID
                                                    </Text>
                                                    <Text size="xs" ff="monospace" c="dimmed" style={{ wordBreak: "break-all" }}>
                                                        {sessionId}
                                                    </Text>
                                                </Box>
                                            )}
                                            {subscription.stripeSubscriptionId && (
                                                <Box>
                                                    <Text size="xs" c="dimmed" mb={4}>
                                                        Subscription ID
                                                    </Text>
                                                    <Text size="xs" ff="monospace" c="dimmed" style={{ wordBreak: "break-all" }}>
                                                        {subscription.stripeSubscriptionId}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </>
                            )}

                            {!loading && !subscription && !error && (
                                <Box
                                    p="md"
                                    style={{
                                        backgroundColor: theme.colors.blue[0],
                                        borderRadius: theme.radius.md,
                                        border: `1px solid ${theme.colors.blue[2]}`,
                                        textAlign: "center",
                                    }}
                                >
                                    <Text size="sm" c="blue.7">
                                        No subscription found. Please contact support if you believe this is an error.
                                    </Text>
                                </Box>
                            )}
                        </Stack>
                    </Card>

                    {/* Action Button */}
                    <Group gap="sm" w="100%" align="center" justify="center">
                        <BaseButton
                            size="lg"
                            variant="filled"
                            color="brandGreen"
                            radius={6}
                            onClick={() => router.push("/")}
                        >
                            Go to Home
                        </BaseButton>
                    </Group>

                    {/* Additional Info */}
                    {!loading && subscription && (
                        <Text size="sm" c="dimmed" ta="center" maw={450}>
                            {subscription.status === "ACTIVE" || subscription.status === "TRIALING" ? (
                                <>
                                    Your subscription is now {subscription.status === "TRIALING" ? "in trial period" : "active"}. 
                                    You can access all premium features from your dashboard.
                                    If you have any questions, feel free to contact our support team.
                                </>
                            ) : (
                                <>
                                    Your subscription status is {subscription.status}. 
                                    Please contact our support team if you need assistance.
                                </>
                            )}
                        </Text>
                    )}
            </Stack>
        </Container>
    );
}
