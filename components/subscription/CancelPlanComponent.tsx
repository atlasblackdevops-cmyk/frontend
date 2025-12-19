"use client";

import {
    Container,
    Title,
    Text,
    Stack,
    Card,
    Badge,
    Group,
    Box,
    Loader,
    Alert,
    Divider,
    List,
    ThemeIcon,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCheck,
    IconCalendar,
    IconCreditCard,
    IconInfoCircle,
    IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import BaseButton from "../ui/BaseButton";
import DeleteConfirmationModal from "../ui/DeleteConfirmationModal";
import { useSubscription } from "../pricing/hooks/useSubscription";
import type { CurrentSubscription } from "@/lib/subscription/api";

export default function CancelPlanComponent() {
    const router = useRouter();
    const theme = useMantineTheme();
    const {
        currentSubscription,
        isLoading,
        error,
        fetchCurrentSubscription,
        cancel,
    } = useSubscription();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrentSubscription();
    }, []);

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

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        setSuccess(null);

        try {
            await cancel(cancelAtPeriodEnd);
            const message = cancelAtPeriodEnd
                ? "Your subscription will be canceled at the end of the current billing period. You'll continue to have access until then."
                : "Your subscription has been canceled immediately.";
            setSuccess(message);
            setCancelModalOpen(false);
            // Refresh subscription data
            await fetchCurrentSubscription();
            // Optionally redirect after a delay
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } catch (err: any) {
            console.error("Failed to cancel subscription:", err);
        } finally {
            setIsCanceling(false);
        }
    };

    const getStatusBadge = (subscription: CurrentSubscription | null) => {
        if (!subscription) return null;

        const status = subscription.status;
        if (status === "ACTIVE") {
            if (subscription.cancelAtPeriodEnd) {
                return (
                    <Badge color="orange" variant="light">
                        Canceling at Period End
                    </Badge>
                );
            }
            return (
                <Badge color="brandGreen" variant="light">
                    Active
                </Badge>
            );
        }
        if (status === "CANCELED") {
            return (
                <Badge color="red" variant="light">
                    Canceled
                </Badge>
            );
        }
        return (
            <Badge color="gray" variant="light">
                {status}
            </Badge>
        );
    };

    return (
        <Container size="md" py={{ base: "xl", md: "4rem" }}>
            <Stack gap="xl">
                {/* Header Section */}
                <Stack gap="md" align="center" ta="center">
                    <Badge
                        size="lg"
                        variant="light"
                        color="red"
                        radius="xl"
                        px="md"
                        py={4}
                    >
                        Cancel Subscription
                    </Badge>
                    <Title
                        order={1}
                        fw={700}
                        style={{
                            background: `linear-gradient(135deg, ${theme.colors.red[6]} 0%, ${theme.colors.orange[6]} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontSize: "2.5rem",
                        }}
                    >
                        Cancel Your Subscription
                    </Title>
                    <Text size="md" c="dimmed" maw={600}>
                        We're sorry to see you go. Please review your subscription details below before canceling.
                    </Text>
                </Stack>

                {/* Success Alert */}
                {success && (
                    <Alert
                        icon={<IconCheck size={16} />}
                        title="Subscription Canceled"
                        color="green"
                        variant="light"
                        onClose={() => setSuccess(null)}
                        withCloseButton
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
                    >
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Box style={{ textAlign: "center", padding: "3rem" }}>
                        <Loader size="lg" color="red" />
                        <Text size="sm" c="dimmed" mt="md">
                            Loading subscription details...
                        </Text>
                    </Box>
                )}

                {/* Subscription Details Card */}
                {!isLoading && currentSubscription && (
                    <Card p="xl" radius="lg" withBorder>
                        <Stack gap="lg">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap="xs">
                                    <Group gap="sm">
                                        <Title order={3} size="h4" fw={600}>
                                            Subscription Details
                                        </Title>
                                        {getStatusBadge(currentSubscription)}
                                    </Group>
                                    {currentSubscription.stripeSubscriptionId && (
                                        <Text size="sm" c="dimmed">
                                            Subscription ID: {currentSubscription.stripeSubscriptionId.substring(0, 20)}...
                                        </Text>
                                    )}
                                </Stack>
                            </Group>

                            <Divider />

                            <Stack gap="md">
                                <Group gap="md">
                                    <ThemeIcon size={40} radius="md" color="blue" variant="light">
                                        <IconCalendar size={20} />
                                    </ThemeIcon>
                                    <Box style={{ flex: 1 }}>
                                        <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                                            Current Period
                                        </Text>
                                        <Text size="sm" fw={500}>
                                            {formatDate(currentSubscription.currentPeriodStart)} -{" "}
                                            {formatDate(currentSubscription.currentPeriodEnd)}
                                        </Text>
                                    </Box>
                                </Group>

                                {currentSubscription.cancelAtPeriodEnd && (
                                    <Alert
                                        icon={<IconInfoCircle size={16} />}
                                        title="Cancellation Scheduled"
                                        color="orange"
                                        variant="light"
                                    >
                                        Your subscription is set to cancel at the end of the current billing period on{" "}
                                        {formatDate(currentSubscription.currentPeriodEnd)}. You'll continue to have access
                                        until then.
                                    </Alert>
                                )}
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* Cancel Subscription Card */}
                {!isLoading && currentSubscription && currentSubscription.status === "ACTIVE" && !currentSubscription.cancelAtPeriodEnd && (
                    <Card
                        p="xl"
                        radius="lg"
                        withBorder
                        style={{
                            borderColor: theme.colors.red[3],
                            backgroundColor: theme.colors.red[0],
                            borderWidth: 2,
                        }}
                    >
                        <Stack gap="lg">
                            <Group gap="md">
                                <ThemeIcon size={48} radius="md" color="red" variant="light">
                                    <IconAlertCircle size={24} />
                                </ThemeIcon>
                                <Box style={{ flex: 1 }}>
                                    <Title order={3} size="h4" fw={600} c="red">
                                        Cancel Subscription
                                    </Title>
                                    <Text size="sm" c="dimmed" mt="xs">
                                        Once canceled, you'll lose access to premium features at the end of your billing period.
                                    </Text>
                                </Box>
                            </Group>

                            <Divider />

                            <Stack gap="md">
                                <Text size="sm" fw={500}>
                                    What happens when you cancel:
                                </Text>
                                <List spacing="sm" size="sm">
                                    <List.Item
                                        icon={
                                            <ThemeIcon color="red" size={20} radius="xl" variant="light">
                                                <IconX size={14} strokeWidth={3} />
                                            </ThemeIcon>
                                        }
                                    >
                                        <Text size="sm">
                                            You'll lose access to premium features after{" "}
                                            {formatDate(currentSubscription.currentPeriodEnd)}
                                        </Text>
                                    </List.Item>
                                    <List.Item
                                        icon={
                                            <ThemeIcon color="red" size={20} radius="xl" variant="light">
                                                <IconX size={14} strokeWidth={3} />
                                            </ThemeIcon>
                                        }
                                    >
                                        <Text size="sm">Your data will be preserved for 30 days after cancellation</Text>
                                    </List.Item>
                                    <List.Item
                                        icon={
                                            <ThemeIcon color="red" size={20} radius="xl" variant="light">
                                                <IconX size={14} strokeWidth={3} />
                                            </ThemeIcon>
                                        }
                                    >
                                        <Text size="sm">You can resubscribe at any time</Text>
                                    </List.Item>
                                </List>
                            </Stack>

                            <BaseButton
                                fullWidth
                                variant="filled"
                                color="red"
                                radius="xl"
                                size="lg"
                                onClick={() => setCancelModalOpen(true)}
                            >
                                Cancel Subscription
                            </BaseButton>
                        </Stack>
                    </Card>
                )}

                {/* Already Canceled Message */}
                {!isLoading &&
                    currentSubscription &&
                    (currentSubscription.status === "CANCELED" || currentSubscription.cancelAtPeriodEnd) && (
                        <Alert
                            icon={<IconInfoCircle size={16} />}
                            title="Subscription Already Canceled"
                            color="blue"
                            variant="light"
                        >
                            {currentSubscription.status === "CANCELED"
                                ? "Your subscription has already been canceled."
                                : `Your subscription is scheduled to cancel on ${formatDate(currentSubscription.currentPeriodEnd)}.`}
                        </Alert>
                    )}

                {/* No Subscription Message */}
                {!isLoading && !currentSubscription && (
                    <Alert
                        icon={<IconInfoCircle size={16} />}
                        title="No Active Subscription"
                        color="blue"
                        variant="light"
                    >
                        You don't have an active subscription to cancel.
                    </Alert>
                )}

                {/* Back Button */}
                <Group justify="center">
                    <BaseButton variant="default" onClick={() => router.back()}>
                        Go Back
                    </BaseButton>
                </Group>
            </Stack>

            {/* Cancel Confirmation Modal */}
            <DeleteConfirmationModal
                opened={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancelSubscription}
                title="Cancel Subscription"
                confirmLabel="Yes, Cancel Subscription"
                cancelLabel="Keep Subscription"
                confirmColor="red"
                isDeleting={isCanceling}
                subtitle={
                    <Stack gap="sm">
                        <Text size="sm">
                            Are you sure you want to cancel your subscription? This action will cancel your subscription
                            at the end of the current billing period ({formatDate(currentSubscription?.currentPeriodEnd)}).
                        </Text>
                        <Text size="sm" c="dimmed">
                            You'll continue to have access to all features until then. You can resubscribe at any time.
                        </Text>
                    </Stack>
                }
            />
        </Container>
    );
}
