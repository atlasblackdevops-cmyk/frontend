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
    Divider,
    Group,
} from "@mantine/core";
import {
    IconX,
    IconAlertCircle,
    IconRefresh,
    IconMail,
    IconPhone,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import BaseButton from "@/components/ui/BaseButton";
import styles from "./PaymentResult.module.css";

export default function PaymentFailedComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useMantineTheme();

    // Get error details from URL params if available
    const errorMessage = searchParams.get("error") || "Payment could not be processed";

    return (
        <Container size="sm" py={{ base: "xl", md: "4rem" }}>
            <Stack gap="xl" align="center">
                {/* Error Icon */}
                <Box className={styles.errorIcon}>
                        <ThemeIcon
                            size={80}
                            radius="50%"
                            color="red"
                            // variant="light"
                            style={{
                                boxShadow: "0 8px 32px rgba(250, 82, 82, 0.25)",
                            }}
                        >
                            <IconX size={45} strokeWidth={2.5} />
                        </ThemeIcon>
                    </Box>

                    {/* Error Message */}
                    <Stack gap="sm" align="center" ta="center" className={styles.slideUp}>
                        <Title
                            order={1}
                            fw={700}
                            style={{
                                background: "linear-gradient(135deg, #fa5252 0%, #e03131 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontSize: "2.5rem",
                            }}
                        >
                            Payment Failed
                        </Title>
                        <Text size="md" c="dimmed" maw={400}>
                            We couldn't process your payment. Please check your payment details and try again.
                        </Text>
                    </Stack>

                    {/* Error Details Card */}
                    <Card
                        w="100%"
                        p="lg"
                        radius="lg"
                        withBorder
                        className="slide-up"
                        style={{
                            borderColor: theme.colors.red[2],
                            backgroundColor: theme.colors.red[0],
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        <Stack gap="sm">
                            <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <ThemeIcon
                                    size={36}
                                    radius="md"
                                    color="red"
                                    variant="light"
                                >
                                    <IconAlertCircle size={20} />
                                </ThemeIcon>
                                <Box style={{ flex: 1 }}>
                                    <Text size="xs" c="dimmed" fw={500}>
                                        Error Details
                                    </Text>
                                    <Text size="sm" fw={600} c="red.7">
                                        {errorMessage}
                                    </Text>
                                </Box>
                            </Box>
                        </Stack>
                    </Card>

                    {/* Common Reasons Card */}
                    <Card
                        w="100%"
                        p="lg"
                        radius="lg"
                        withBorder
                        className={styles.slideUp}
                        style={{
                            borderColor: theme.colors.gray[2],
                            backgroundColor: theme.white,
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <Stack gap="md">
                            <Text size="lg" fw={600}>
                                Common Reasons for Payment Failure
                            </Text>
                            
                            <List spacing="sm" size="sm">
                                <List.Item>
                                    <Text size="sm">
                                        <strong>Insufficient funds:</strong> Make sure your account has enough balance
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text size="sm">
                                        <strong>Incorrect card details:</strong> Verify your card number, expiry date, and CVV
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text size="sm">
                                        <strong>Card declined:</strong> Your bank may have declined the transaction
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text size="sm">
                                        <strong>Network issues:</strong> Check your internet connection and try again
                                    </Text>
                                </List.Item>
                                <List.Item>
                                    <Text size="sm">
                                        <strong>Expired card:</strong> Check if your payment card is still valid
                                    </Text>
                                </List.Item>
                            </List>
                        </Stack>
                    </Card>

                    {/* Action Buttons */}
                    <Group  gap="sm" w="100%" align="center" justify="center" className={styles.slideUp}>
                        <BaseButton
                            size="lg"
                            variant="filled"
                            color="brandGreen"
                            radius={6}
                            leftSection={<IconRefresh size={20} />}
                            onClick={() => router.push("/subscription")}
                        >
                            Try Again
                        </BaseButton>
                        <BaseButton
                            size="lg"
                            variant="outline"
                            color="gray"
                            radius={6}
                            onClick={() => router.push("/")}
                        >
                            Return to Home
                        </BaseButton>
                    </Group>

                    <Divider w="100%" />

                    {/* Support Section */}
                    <Card
                        w="100%"
                        p="lg"
                        radius="lg"
                        withBorder
                        className={styles.slideUp}
                        style={{
                            borderColor: theme.colors.blue[2],
                            backgroundColor: theme.colors.blue[0],
                        }}
                    >
                        <Stack gap="md">
                            <Text size="md" fw={600} c="blue.7">
                                Need Help?
                            </Text>
                            <Text size="sm" c="dimmed">
                                If you continue to experience issues, our support team is here to help.
                            </Text>
                            
                            <Stack gap="xs">
                                <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <ThemeIcon size={24} radius="md" color="blue" variant="light">
                                        <IconMail size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={500}>
                                        support@farmmanagement.com
                                    </Text>
                                </Box>
                                <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <ThemeIcon size={24} radius="md" color="blue" variant="light">
                                        <IconPhone size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={500}>
                                        1-800-FARM-HELP
                                    </Text>
                                </Box>
                            </Stack>
                        </Stack>
                    </Card>
            </Stack>
        </Container>
    );
}
