"use client";

import BaseButton from "@/components/ui/BaseButton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Divider,
  FileButton,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  ActionIcon,
  Tabs,
  Card,
  List,
  ThemeIcon,
  useMantineTheme,
  Box,
  Grid,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBuilding,
  IconTrash,
  IconUpload,
  IconUser,
  IconEye,
  IconCreditCard,
  IconArrowRight,
  IconX,
  IconCheck,
  IconLeaf,
  IconTrendingUp,
  IconShare,
  IconCopy,
  IconUsers,
  IconCoin,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../pricing/hooks/useSubscription";

export default function SettingsPage() {
  const router = useRouter();
  const theme = useMantineTheme();
  const { 
    role, 
    userName, 
    userEmail, 
    userProfilePicture, 
    setUserData, 
    farmId,
    setReferralData,
  } = useAuth();
  const isOwner = (role ?? "").toUpperCase() === "OWNER";
  const { 
    currentSubscription, 
    fetchCurrentSubscription, 
    plans,
    fetchPlans,
    isLoading: subscriptionLoading 
  } = useSubscription();

  // Helper to get plan metadata (similar to PricingPageComponent)
  const getPlanMetadata = (interval: string, intervalCount: number = 1) => {
    if (interval === "month" && intervalCount === 1) {
      return { icon: IconLeaf, color: "brandGreen", description: "Basic Monthly Plan" };
    }
    if (interval === "month" && intervalCount === 6) {
      return { icon: IconTrendingUp, color: "blue", description: "Pro 6-Month Plan" };
    }
    if (interval === "year") {
      return { icon: IconBuilding, color: "violet", description: "Business Yearly Plan" };
    }
    return { icon: IconLeaf, color: "brandGreen", description: "Subscription Plan" };
  };

  // User details state
  const [userNameValue, setUserNameValue] = useState(userName || "");
  const [userEmailValue, setUserEmailValue] = useState(userEmail || "");
  const [userProfilePictureFile, setUserProfilePictureFile] =
    useState<File | null>(null);
  const [userProfilePicturePreview, setUserProfilePicturePreview] = useState<
    string | null
  >(userProfilePicture || null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState(false);
  const [userDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
  const [userPreviewModalOpen, setUserPreviewModalOpen] = useState(false);

  // Farm details state
  const [farmName, setFarmName] = useState("");
  const [farmLogoFile, setFarmLogoFile] = useState<File | null>(null);
  const [farmLogoPreview, setFarmLogoPreview] = useState<string | null>(null);
  const [farmCity, setFarmCity] = useState("");
  const [farmState, setFarmState] = useState("");
  const [farmCountry, setFarmCountry] = useState("");
  const [farmAddress, setFarmAddress] = useState("");
  const [farmSubmitting, setFarmSubmitting] = useState(false);
  const [farmError, setFarmError] = useState<string | null>(null);
  const [farmSuccess, setFarmSuccess] = useState(false);
  const [farmDeleteModalOpen, setFarmDeleteModalOpen] = useState(false);
  const [farmPreviewModalOpen, setFarmPreviewModalOpen] = useState(false);

  // Fetch farm details
  const { data: farmData, refetch: refetchFarm } = useQuery({
    queryKey: ["farm-details", farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const res = await api.get(`/api/v1/farms/${farmId}`);
      return res?.data?.data ?? res?.data ?? null;
    },
    enabled: !!farmId && isOwner,
  });

  // Fetch referral data from API (only on mount and manual refresh)
  const { 
    data: referralData, 
    refetch: refetchReferrals,
    isLoading: isLoadingReferrals 
  } = useQuery({
    queryKey: ["user-referral-data"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      const payload = res?.data?.data ?? res?.data ?? {};
      return {
        referralCode: payload?.referralCode || null,
        totalReferralPoints: payload?.totalReferralPoints || 0,
        availableReferralPoints: payload?.availableReferralPoints || 0,
        totalReferrals: payload?.totalReferrals || 0,
        successfulReferrals: payload?.successfulReferrals || 0,
        pendingReferrals: payload?.pendingReferrals || 0,
      };
    },
    enabled: true, // Fetch when component mounts
    refetchOnWindowFocus: false, // Don't auto-refetch on window focus
    staleTime: Infinity, // Data never goes stale (only refresh manually)
  });

  // Use API data if available, fallback to auth store
  const referralCode = referralData?.referralCode || null;
  const totalReferralPoints = referralData?.totalReferralPoints ?? 0;
  const availableReferralPoints = referralData?.availableReferralPoints ?? 0;
  const totalReferrals = referralData?.totalReferrals ?? 0;
  const successfulReferrals = referralData?.successfulReferrals ?? 0;
  const pendingReferrals = referralData?.pendingReferrals ?? 0;

  // Update farm state when data is fetched
  useEffect(() => {
    if (farmData) {
      setFarmName(farmData.farmName || farmData.name || "");
      setFarmLogoPreview(farmData.farmLogo || farmData.logo || null);
      setFarmCity(farmData.city || "");
      setFarmState(farmData.state || "");
      setFarmCountry(farmData.country || "");
      setFarmAddress(farmData.address || "");
    } else {
      setFarmName("");
      setFarmLogoPreview(null);
      setFarmCity("");
      setFarmState("");
      setFarmCountry("");
      setFarmAddress("");
    }
  }, [farmData]);

  // Update user state when auth store changes
  useEffect(() => {
    setUserNameValue(userName || "");
    setUserEmailValue(userEmail || "");
    setUserProfilePicturePreview(userProfilePicture || null);
  }, [userName, userEmail, userProfilePicture]);

  // Sync referral data to auth store when fetched
  useEffect(() => {
    if (referralData) {
      setReferralData(referralData);
    }
  }, [referralData, setReferralData]);

  // Fetch subscription data for owners
  useEffect(() => {
    if (isOwner) {
      fetchCurrentSubscription();
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  // Handle user profile picture change
  const handleUserProfilePictureChange = (file: File | null) => {
    if (file) {
      setUserProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle farm logo change
  const handleFarmLogoChange = (file: File | null) => {
    if (file) {
      setFarmLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFarmLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle user profile picture deletion
  const handleUserProfilePictureDelete = () => {
    setUserProfilePictureFile(null);
    setUserProfilePicturePreview(userProfilePicture || null);
    setUserDeleteModalOpen(false);
  };

  // Handle farm logo deletion
  const handleFarmLogoDelete = () => {
    setFarmLogoFile(null);
    setFarmLogoPreview(farmData?.farmLogo || farmData?.logo || null);
    setFarmDeleteModalOpen(false);
  };

  // User details validation
  const userErrors = useMemo(() => {
    const e: Record<string, string | null> = {
      name: null,
      email: null,
    };
    if (!userNameValue || userNameValue.trim().length < 2) {
      e.name = "Name is required (min 2 characters)";
    }
    if (!userEmailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmailValue)) {
      e.email = "Valid email is required";
    }
    return e;
  }, [userNameValue, userEmailValue]);

  const isUserFormValid = !userErrors.name && !userErrors.email;

  // Farm details validation
  const farmErrors = useMemo(() => {
    const e: Record<string, string | null> = {
      farmName: null,
    };
    if (!farmName || farmName.trim().length < 2) {
      e.farmName = "Farm name is required (min 2 characters)";
    }
    return e;
  }, [farmName]);

  const isFarmFormValid = !farmErrors.farmName;

  // Handle user details update
  const handleUserUpdate = async () => {
    setUserError(null);
    setUserSuccess(false);
    if (!isUserFormValid) return;

    setUserSubmitting(true);
    try {
      const formData = new FormData();
      if (userNameValue.trim()) {
        formData.append("name", userNameValue.trim());
      }
      if (userEmailValue.trim()) {
        formData.append("email", userEmailValue.trim().toLowerCase());
      }
      if (userProfilePictureFile) {
        formData.append("profilePicture", userProfilePictureFile);
      }

      const { data } = await api.put("/api/v1/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedData = data?.data ?? data ?? {};

      // Update auth store
      setUserData({
        name: updatedData.name ?? userNameValue.trim(),
        email: updatedData.email ?? userEmailValue.trim().toLowerCase(),
        profilePicture: updatedData.profilePicture ?? userProfilePicturePreview,
      });

      setUserProfilePictureFile(null);
      setUserSuccess(true);
      setTimeout(() => setUserSuccess(false), 3000);
    } catch (e: any) {
      setUserError(
        e?.response?.data?.message ?? e?.message ?? "Failed to update profile"
      );
    } finally {
      setUserSubmitting(false);
    }
  };

  // Handle farm details update
  const handleFarmUpdate = async () => {
    setFarmError(null);
    setFarmSuccess(false);
    if (!isFarmFormValid || !farmId) return;

    setFarmSubmitting(true);
    try {
      const formData = new FormData();
      if (farmName.trim()) formData.append("farmName", farmName.trim());
      if (farmCity.trim()) formData.append("city", farmCity.trim());
      if (farmState.trim()) formData.append("state", farmState.trim());
      if (farmCountry.trim()) formData.append("country", farmCountry.trim());
      if (farmAddress.trim()) formData.append("address", farmAddress.trim());
      if (farmLogoFile) formData.append("farmLogo", farmLogoFile);

      await api.put(`/api/v1/farms/${farmId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFarmLogoFile(null);
      setFarmSuccess(true);
      setTimeout(() => setFarmSuccess(false), 3000);
      refetchFarm();
    } catch (e: any) {
      setFarmError(
        e?.response?.data?.message ??
          e?.message ??
          "Failed to update farm details"
      );
    } finally {
      setFarmSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<string | null>("user");
  const [referralCodeCopied, setReferralCodeCopied] = useState(false);

  return (
    <Stack gap="xl" p="md">
      <Title order={2}>Settings</Title>

      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
        <Tabs.List mb="lg">
              <Tabs.Tab value="user" leftSection={<IconUser size={16} />}>
            User Profile
          </Tabs.Tab>
          <Tabs.Tab value="referrals" leftSection={<IconShare size={16} />}>
            Referrals
          </Tabs.Tab>
          {isOwner && (
            <>
              <Tabs.Tab value="farm" leftSection={<IconBuilding size={16} />}>
                Farm Details
              </Tabs.Tab>
              <Tabs.Tab value="subscription" leftSection={<IconCreditCard size={16} />}>
                Subscription
              </Tabs.Tab>
            </>
          )}
        </Tabs.List>

        <Tabs.Panel value="user">
          {/* User Details Section */}
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group gap="xs">
                <IconUser size={20} />
                <Title order={3}>User Details</Title>
              </Group>
              <Divider />

              {userError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Error"
                  color="red"
                >
                  {userError}
                </Alert>
              )}

              {userSuccess && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Success"
                  color="green"
                >
                  Profile updated successfully!
                </Alert>
              )}

              <Stack gap="md">
                {/* Profile Picture */}
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Profile Picture
                  </Text>
                  <Group gap="md">
                    {userProfilePicturePreview ? (
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          const overlay = e.currentTarget.querySelector(
                            '[data-overlay]'
                          ) as HTMLElement;
                          if (overlay) overlay.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          const overlay = e.currentTarget.querySelector(
                            '[data-overlay]'
                          ) as HTMLElement;
                          if (overlay) overlay.style.opacity = "0";
                        }}
                        onClick={() => setUserPreviewModalOpen(true)}
                      >
                        <Avatar
                          src={userProfilePicturePreview}
                          size={80}
                          radius="md"
                          alt="Profile picture"
                        />
                        <div
                          data-overlay
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                            pointerEvents: "none",
                          }}
                        >
                          <ActionIcon
                            variant="subtle"
                            size="lg"
                            radius="md"
                            style={{
                              color: "white",
                              backgroundColor: "transparent",
                            }}
                          >
                            <IconEye size={20} color="white" />
                          </ActionIcon>
                        </div>
                      </div>
                    ) : (
                      <Avatar size={80} radius="md" alt="Profile picture" />
                    )}
                    <Stack gap="xs">
                      <FileButton
                        onChange={handleUserProfilePictureChange}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                      >
                        {(props) => (
                          <Button
                            {...props}
                            leftSection={<IconUpload size={16} />}
                            variant="light"
                            size="sm"
                          >
                            Upload Photo
                          </Button>
                        )}
                      </FileButton>
                      {userProfilePicturePreview && (
                        <Group
                          onClick={() => setUserDeleteModalOpen(true)}
                          gap="xs"
                          style={{ cursor: "pointer", paddingLeft: 10 }}
                          align="center"
                        >
                          <IconTrash size={16} color="red" />
                          <Text size="sm" fw={500} color="red">
                            Remove
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Group>
                </Stack>

                {/* Name */}
                <TextInput
                  label="Name"
                  placeholder="Enter your name"
                  value={userNameValue}
                  onChange={(e) => setUserNameValue(e.currentTarget.value)}
                  error={userErrors.name}
                  required
                />

                {/* Email */}
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={userEmailValue}
                  onChange={(e) => setUserEmailValue(e.currentTarget.value)}
                  error={userErrors.email}
                  required
                />

                <BaseButton
                  onClick={handleUserUpdate}
                  loading={userSubmitting}
                  disabled={!isUserFormValid}
                >
                  Update Profile
                </BaseButton>
              </Stack>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="referrals">
          {/* Referral Section */}
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group gap="xs" justify="space-between">
                <Group gap="xs">
                  <IconShare size={20} />
                  <Title order={3}>Referral Program</Title>
                </Group>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => refetchReferrals()}
                  loading={isLoadingReferrals}
                >
                  Refresh
                </Button>
              </Group>
              <Divider />

              {isLoadingReferrals ? (
                <Stack align="center" py="xl">
                  <Text size="sm" c="dimmed">Loading referral data...</Text>
                </Stack>
              ) : (
              <Stack gap="lg">
                {/* Referral Code */}
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Your Referral Code
                  </Text>
                  <Group gap="sm">
                    <TextInput
                      value={referralCode || ""}
                      readOnly
                      styles={{
                        input: {
                          fontFamily: "monospace",
                          fontSize: "16px",
                          fontWeight: 600,
                          letterSpacing: "2px",
                        },
                      }}
                      rightSection={
                        <ActionIcon
                          variant="subtle"
                          onClick={() => {
                            if (referralCode) {
                              navigator.clipboard.writeText(referralCode);
                              setReferralCodeCopied(true);
                              setTimeout(() => setReferralCodeCopied(false), 2000);
                            }
                          }}
                        >
                          {referralCodeCopied ? (
                            <IconCheck size={18} color="green" />
                          ) : (
                            <IconCopy size={18} />
                          )}
                        </ActionIcon>
                      }
                    />
                    <BaseButton
                      variant="light"
                      leftSection={<IconShare size={16} />}
                      onClick={() => {
                        if (referralCode && typeof window !== "undefined") {
                          const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
                          navigator.clipboard.writeText(referralLink);
                          setReferralCodeCopied(true);
                          setTimeout(() => setReferralCodeCopied(false), 2000);
                        }
                      }}
                    >
                      Copy Link
                    </BaseButton>
                  </Group>
                  {referralCodeCopied && (
                    <Text size="xs" c="green">
                      Copied to clipboard!
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">
                    Share your referral code with friends and earn points when they sign up!
                  </Text>
                </Stack>

                {/* Referral Statistics */}
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder p="md" radius="md">
                      <Stack gap="xs" align="center">
                        <ThemeIcon size={48} radius="xl" color="blue" variant="light">
                          <IconUsers size={24} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" ta="center">
                          Total Referrals
                        </Text>
                        <Text size="xl" fw={700}>
                          {totalReferrals}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder p="md" radius="md">
                      <Stack gap="xs" align="center">
                        <ThemeIcon size={48} radius="xl" color="green" variant="light">
                          <IconCheck size={24} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" ta="center">
                          Successful
                        </Text>
                        <Text size="xl" fw={700} c="green">
                          {successfulReferrals}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Card withBorder p="md" radius="md">
                      <Stack gap="xs" align="center">
                        <ThemeIcon size={48} radius="xl" color="yellow" variant="light">
                          <IconAlertCircle size={24} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" ta="center">
                          Pending
                        </Text>
                        <Text size="xl" fw={700} c="yellow">
                          {pendingReferrals}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                {/* Points Section */}
                <Divider label="Points" labelPosition="center" />
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Card withBorder p="md" radius="md" style={{ backgroundColor: theme.colors.green[0] }}>
                      <Stack gap="xs">
                        <Group gap="xs">
                          <ThemeIcon size={32} radius="xl" color="green" variant="light">
                            <IconCoin size={18} />
                          </ThemeIcon>
                          <Text size="sm" fw={600}>
                            Total Points Earned
                          </Text>
                        </Group>
                        <Text size="xl" fw={700} c="green">
                          {totalReferralPoints}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Card withBorder p="md" radius="md" style={{ backgroundColor: theme.colors.blue[0] }}>
                      <Stack gap="xs">
                        <Group gap="xs">
                          <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                            <IconCoin size={18} />
                          </ThemeIcon>
                          <Text size="sm" fw={600}>
                            Available Points
                          </Text>
                        </Group>
                        <Text size="xl" fw={700} c="blue">
                          {availableReferralPoints}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Ready to redeem
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                <Alert color="blue" variant="light" radius="md">
                  <Text size="sm">
                    <strong>How it works:</strong> Share your referral code with friends. When they sign up using your code, you'll earn referral points. Points can be redeemed for discounts and credits (coming soon).
                  </Text>
                </Alert>
              </Stack>
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {isOwner && (
          <>
            <Tabs.Panel value="farm">
              {/* Farm Details Section (owners only) */}
              <Paper withBorder p="lg" radius="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <IconBuilding size={20} />
                    <Title order={3}>Farm Details</Title>
                  </Group>
                  <Divider />

                  {farmError && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Error"
                      color="red"
                    >
                      {farmError}
                    </Alert>
                  )}

                  {farmSuccess && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Success"
                      color="green"
                    >
                      Farm details updated successfully!
                    </Alert>
                  )}

                  <Stack gap="md">
                    {/* Farm Logo */}
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Farm Logo
                      </Text>
                      <Group gap="md">
                        {farmLogoPreview ? (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              const overlay = e.currentTarget.querySelector(
                                '[data-overlay]'
                              ) as HTMLElement;
                              if (overlay) overlay.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              const overlay = e.currentTarget.querySelector(
                                '[data-overlay]'
                              ) as HTMLElement;
                              if (overlay) overlay.style.opacity = "0";
                            }}
                            onClick={() => setFarmPreviewModalOpen(true)}
                          >
                            <Avatar
                              src={farmLogoPreview}
                              size={80}
                              radius="md"
                              alt="Farm logo"
                              variant="light"
                            />
                            <div
                              data-overlay
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity 0.2s ease",
                                pointerEvents: "none",
                              }}
                            >
                              <ActionIcon
                                variant="subtle"
                                size="lg"
                                radius="md"
                                style={{
                                  color: "white",
                                  backgroundColor: "transparent",
                                }}
                              >
                                <IconEye size={20} color="white" />
                              </ActionIcon>
                            </div>
                          </div>
                        ) : (
                          <Avatar size={80} radius="md" variant="light" color="gray">
                            <IconBuilding size={40} />
                          </Avatar>
                        )}
                        <Stack gap="xs">
                          <FileButton
                            onChange={handleFarmLogoChange}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                          >
                            {(props) => (
                              <Button
                                {...props}
                                leftSection={<IconUpload size={16} />}
                                variant="light"
                                size="sm"
                              >
                                Upload Logo
                              </Button>
                            )}
                          </FileButton>
                          {farmLogoPreview && (
                            <Group
                              onClick={() => setFarmDeleteModalOpen(true)}
                              gap="xs"
                              style={{ cursor: "pointer", paddingLeft: 10 }}
                              align="center"
                            >
                              <IconTrash size={16} color="red" />
                              <Text size="sm" fw={500} color="red">
                                Remove
                              </Text>
                            </Group>
                          )}
                        </Stack>
                      </Group>
                    </Stack>

                    {/* Farm Name */}
                    <TextInput
                      label="Farm Name"
                      placeholder="Enter farm name"
                      value={farmName}
                      onChange={(e) => setFarmName(e.currentTarget.value)}
                      error={farmErrors.farmName}
                      required
                    />

                    <TextInput
                      label="City"
                      placeholder="Enter city"
                      value={farmCity}
                      onChange={(e) => setFarmCity(e.currentTarget.value)}
                    />

                    <TextInput
                      label="State"
                      placeholder="Enter state"
                      value={farmState}
                      onChange={(e) => setFarmState(e.currentTarget.value)}
                    />

                    <TextInput
                      label="Country"
                      placeholder="Enter country"
                      value={farmCountry}
                      onChange={(e) => setFarmCountry(e.currentTarget.value)}
                    />

                    <Textarea
                      label="Address"
                      placeholder="Street, area, zip"
                      minRows={3}
                      value={farmAddress}
                      onChange={(e) => setFarmAddress(e.currentTarget.value)}
                    />

                    <BaseButton
                      onClick={handleFarmUpdate}
                      loading={farmSubmitting}
                      disabled={!isFarmFormValid}
                    >
                      Update Farm Details
                    </BaseButton>
                  </Stack>
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="subscription">
              {/* Subscription Section - Only for Owners */}
              <Stack gap="lg">
                <Group gap="xs">
                  <IconCreditCard size={20} />
                  <Title order={3}>Subscription Management</Title>
                </Group>
                
                {subscriptionLoading ? (
                  <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
                    <Text size="sm" c="dimmed">
                      Loading subscription details...
                    </Text>
                  </Paper>
                ) : currentSubscription && currentSubscription.status === "ACTIVE" ? (
                  <Card withBorder radius="lg" p={0} style={{ overflow: 'hidden' }}>
                    {/* Compact Card Layout */}
                    <Group wrap="nowrap" gap={0} align="stretch" grow>
                      {/* Left Side: Plan Info with Gradient */}
                      <Box 
                        p="xl" 
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.colors.brandGreen[6]} 0%, ${theme.colors.brandGreen[8]} 100%)`,
                          color: 'white',
                          minWidth: '280px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Stack gap="xs">
                          {(() => {
                            const plan = plans.find(p => p.priceId === currentSubscription.stripePriceId);
                            const metadata = getPlanMetadata(plan?.interval || 'month', plan?.intervalCount || 1);
                            const Icon = metadata.icon;
                            
                            return (
                              <>
                                <ThemeIcon size={48} radius="md" color="white" variant="white" style={{ color: theme.colors.brandGreen[6] }}>
                                  <Icon size={28} />
                                </ThemeIcon>
                                <Title order={2} style={{ color: 'white' }}>
                                  {plan?.name || "Current Plan"}
                                </Title>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {metadata.description}
                                </Text>
                              </>
                            );
                          })()}
                          
                          <Group gap="xs" mt="md">
                            <Badge color="white" variant="white" style={{ color: theme.colors.brandGreen[7] }}>
                              {currentSubscription.cancelAtPeriodEnd ? "CANCeling" : "ACTIVE"}
                            </Badge>
                          </Group>
                        </Stack>
                      </Box>

                      {/* Right Side: Details and Actions */}
                      <Box p="xl" style={{ flex: 1, backgroundColor: theme.white }}>
                        <Stack gap="md" justify="space-between" h="100%">
                          <Stack gap="md">
                            <Group justify="space-between">
                              <Text fw={600} size="sm">Subscription Details</Text>
                              <IconCheck size={18} color={theme.colors.brandGreen[6]} />
                            </Group>
                            
                            <Divider />
                            
                            <Grid>
                              <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Status</Text>
                                <Text size="sm" fw={500}>
                                  {currentSubscription.cancelAtPeriodEnd ? "Canceling at period end" : "Active & Auto-renewing"}
                                </Text>
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Next Billing Date</Text>
                                <Text size="sm" fw={500}>
                                  {currentSubscription.currentPeriodEnd 
                                    ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </Text>
                              </Grid.Col>
                            </Grid>

                            <List
                              spacing="xs"
                              size="sm"
                              mt="sm"
                              icon={
                                <ThemeIcon color="brandGreen" size={16} radius="xl">
                                  <IconCheck size={10} strokeWidth={4} />
                                </ThemeIcon>
                              }
                            >
                              <List.Item>Access to all premium features</List.Item>
                              <List.Item>Priority customer support</List.Item>
                              <List.Item>Advanced analytics & reporting</List.Item>
                            </List>
                          </Stack>

                          <Group gap="sm" mt="xl">
                            <BaseButton
                              variant="outline"
                              color="brandGreen"
                              onClick={() => router.push("/subscription/change-plan")}
                              rightSection={<IconArrowRight size={16} />}
                              style={{ flex: 1 }}
                            >
                              Change Plan
                            </BaseButton>
                            <BaseButton
                              variant="subtle"
                              color="red"
                              onClick={() => router.push("/subscription/cancel")}
                              rightSection={<IconX size={16} />}
                              disabled={currentSubscription.cancelAtPeriodEnd}
                            >
                              {currentSubscription.cancelAtPeriodEnd ? "Cancellation Scheduled" : "Cancel"}
                            </BaseButton>
                          </Group>
                        </Stack>
                      </Box>
                    </Group>
                  </Card>
                ) : (
                  <Card withBorder radius="lg" p="xl" style={{ textAlign: 'center', backgroundColor: theme.colors.gray[0] }}>
                    <Stack align="center" gap="md">
                      <ThemeIcon size={64} radius="xl" color="gray" variant="light">
                        <IconCreditCard size={32} />
                      </ThemeIcon>
                      <Title order={3}>No Active Subscription</Title>
                      <Text size="sm" c="dimmed" maw={400}>
                        Subscribe to a plan to unlock all premium features and grow your farm more effectively.
                      </Text>
                      <BaseButton
                        variant="filled"
                        color="brandGreen"
                        size="md"
                        onClick={() => router.push("/subscription")}
                        rightSection={<IconArrowRight size={16} />}
                        mt="md"
                      >
                        Explore Pricing Plans
                      </BaseButton>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>
          </>
        )}
      </Tabs>

      {/* User Profile Picture Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={userDeleteModalOpen}
        onClose={() => setUserDeleteModalOpen(false)}
        onConfirm={handleUserProfilePictureDelete}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmColor="red"
      />

      {/* Farm Logo Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={farmDeleteModalOpen}
        onClose={() => setFarmDeleteModalOpen(false)}
        onConfirm={handleFarmLogoDelete}
        title="Remove Farm Logo"
        message="Are you sure you want to remove the farm logo? This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmColor="red"
      />

      {/* User Profile Picture Preview Modal */}
      <ImagePreviewModal
        opened={userPreviewModalOpen}
        onClose={() => setUserPreviewModalOpen(false)}
        imageUrl={userProfilePicturePreview}
        title="Profile Picture Preview"
        alt="Profile picture preview"
      />

      {/* Farm Logo Preview Modal */}
      <ImagePreviewModal
        opened={farmPreviewModalOpen}
        onClose={() => setFarmPreviewModalOpen(false)}
        imageUrl={farmLogoPreview}
        title="Farm Logo Preview"
        alt="Farm logo preview"
      />
    </Stack>
  );
}

