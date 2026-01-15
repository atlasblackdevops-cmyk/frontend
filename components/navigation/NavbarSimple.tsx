"use client";

import FarmSwitcherModal from "@/components/farm/FarmSwitcherModal";
import { api } from "@/lib/api";
import { hasRoutePermission } from "@/lib/permissions";
import { useAuth } from "@/stores/use-auth-store";
import { ActionIcon, Box, Collapse, Group, Text, Tooltip } from "@mantine/core";
import {
    IconBasket,
    IconChartBar,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconCircleCheck,
    IconCpu,
    IconCurrencyDollar,
    IconDeer,
    IconDroplet,
    IconFlask,
    IconLayoutDashboard,
    IconMapPin,
    IconPlant2,
    IconSeeding,
    IconSelector,
    IconSettings,
    IconShoppingCart,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import classes from "./NavbarSimple.module.css";
import { UserButton } from "./UserButton";

interface NavItem {
    link: string;
    label: string;
    icon: React.ComponentType<{ className?: string; stroke?: number }>;
    children?: NavItem[];
}

const data: NavItem[] = [
    { link: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { link: "/fields", label: "Fields", icon: IconMapPin },
    {
        link: "/livestock",
        label: "Livestock",
        icon: IconDeer,
        children: [
            {
                link: "/livestock/dashboard",
                label: "Dashboard",
                icon: IconChartBar,
            },
            { link: "/livestock/animals", label: "Animals", icon: IconDeer },
            {
                link: "/livestock/groups",
                label: "Groups",
                icon: IconUsersGroup,
            },
        ],
    },
    {
        link: "/crops",
        label: "Crops",
        icon: IconPlant2,
        children: [
            { link: "/crops/planting", label: "Planting", icon: IconSeeding },
            { link: "/crops/harvests", label: "Harvests", icon: IconBasket },
            {
                link: "/crops/irrigation",
                label: "Irrigation",
                icon: IconDroplet,
            },
            { link: "/crops/fertilizer", label: "Fertilizer", icon: IconFlask },
            {
                link: "/crops/health-notes",
                label: "Crop Health Notes",
                icon: IconCircleCheck,
            },
        ],
    },
    {
        link: "/finance",
        label: "Finance",
        icon: IconCurrencyDollar,
        children: [
            {
                link: "/finance/expense",
                label: "Expense",
                icon: IconCurrencyDollar,
            },
            { link: "/finance/revenue", label: "Revenue", icon: IconChartBar },
        ],
    },
    { link: "/marketplace", label: "Marketplace", icon: IconShoppingCart },
    { link: "/ai", label: "AI", icon: IconCpu },
    { link: "/users", label: "Users", icon: IconUsersGroup },
];

interface Farm {
    id: string;
    farmId?: string;
    farmName?: string;
    name?: string;
}

export function NavbarSimple() {
    const router = useRouter();
    const pathname = usePathname();
    const {
        token,
        setToken,
        setRefreshToken,
        setRoleAndFarm,
        setUserData,
        farmId,
        farmName,
        role,
        permissions,
        userName,
        userEmail,
        userProfilePicture,
    } = useAuth();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarCollapsed");
            return saved === "true";
        }
        return false;
    });

    // Fetch farms list (for switch farm modal)
    const { data: farmsData } = useQuery({
        queryKey: ["owner-farms"],
        queryFn: async () => {
            const res = await api.get("/api/v1/farms");
            return (res?.data?.data ?? res?.data ?? []) as Farm[];
        },
        enabled: !!farmId,
    });

    const farms = Array.isArray(farmsData) ? farmsData : [];

    async function handleLogout() {
        if (logoutLoading) return;
        setLogoutLoading(true);
        try {
            const storedAccessToken =
                token ||
                (typeof window !== "undefined" &&
                    (localStorage.getItem("accessToken") ||
                        sessionStorage.getItem("accessToken"))) ||
                null;

            // First, clear NextAuth session cookie to avoid re-auth race
            await signOut({ redirect: false });

            // Best-effort backend logout (use captured token)
            if (storedAccessToken) {
                void api
                    .post("/api/v1/auth/logout", undefined, {
                        headers: {
                            Authorization: `Bearer ${storedAccessToken}`,
                        },
                    })
                    .catch(() => {
                        // ignore
                    });
            }

            // Now clear tokens from storage and state
            try {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("refreshToken");
                }
            } catch {
                // no-op
            }
            setToken(null);
            setRefreshToken(null);
            setRoleAndFarm({
                role: null,
                hasFarm: null,
                farmId: null,
                farmName: null,
            });
            setUserData({ name: null, email: null, profilePicture: null });

            // Finally navigate to login
            router.replace("/login");
        } finally {
            setLogoutLoading(false);
        }
    }

    // Check if pathname matches a route (including nested routes)
    const isRouteActive = (link: string, children?: NavItem[]) => {
        if (pathname === link) return true;
        if (children) {
            return children.some(
                (child) =>
                    pathname === child.link ||
                    pathname.startsWith(child.link + "/")
            );
        }
        return pathname.startsWith(link + "/");
    };

    // Toggle menu expansion
    const toggleMenu = (link: string) => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(link)) {
                newSet.delete(link);
            } else {
                newSet.add(link);
            }
            return newSet;
        });
    };

    // Auto-expand menus if current path matches
    useEffect(() => {
        data.forEach((item) => {
            if (item.children && isRouteActive(item.link, item.children)) {
                setExpandedMenus((prev) => new Set(prev).add(item.link));
            }
        });
    }, [pathname]);

    // Save collapsed state to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebarCollapsed", collapsed.toString());
        }
    }, [collapsed]);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
        // Close all expanded menus when collapsing
        if (!collapsed) {
            setExpandedMenus(new Set());
        }
    };

    // Filter links based on permissions (OWNER/SUPER_ADMIN see all)
    const filteredLinks = data.filter((item) =>
        hasRoutePermission(item.link, permissions, role)
    );

    const renderNavItem = (item: NavItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.has(item.link);
        const isActive = isRouteActive(item.link, item.children);
        const hasActiveChild = item.children?.some(
            (child) =>
                pathname === child.link || pathname.startsWith(child.link + "/")
        );

        if (hasChildren) {
            const linkContent = (
                <a
                    href="#"
                    className={`${classes.link} ${collapsed ? classes.linkCollapsed : ""}`}
                    data-active={isActive || undefined}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!collapsed) {
                            toggleMenu(item.link);
                        }
                    }}
                >
                    <item.icon className={classes.linkIcon} stroke={1.5} />
                    {!collapsed && (
                        <span style={{ flex: 1 }}>{item.label}</span>
                    )}
                    {!collapsed &&
                        (isExpanded ? (
                            <IconChevronDown
                                size={16}
                                className={classes.linkIcon}
                            />
                        ) : (
                            <IconChevronRight
                                size={16}
                                className={classes.linkIcon}
                            />
                        ))}
                </a>
            );

            return (
                <div key={item.label}>
                    {collapsed ? (
                        <Tooltip label={item.label} position="right" withArrow>
                            {linkContent}
                        </Tooltip>
                    ) : (
                        linkContent
                    )}
                    {!collapsed && (
                        <Collapse in={isExpanded}>
                            <div className={classes.submenu}>
                                {item.children?.map((child) => {
                                    const isChildActive =
                                        pathname === child.link ||
                                        pathname.startsWith(child.link + "/");
                                    return (
                                        <Link
                                            href={child.link}
                                            key={child.label}
                                            className={classes.sublink}
                                            data-active={
                                                isChildActive || undefined
                                            }
                                        >
                                            <child.icon
                                                className={classes.linkIcon}
                                                stroke={1.5}
                                            />
                                            <span>{child.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </Collapse>
                    )}
                </div>
            );
        }

        const linkContent = (
            <Link
                href={item.link}
                key={item.label}
                className={`${classes.link} ${collapsed ? classes.linkCollapsed : ""}`}
                data-active={isActive || undefined}
            >
                <item.icon className={classes.linkIcon} stroke={1.5} />
                {!collapsed && <span>{item.label}</span>}
            </Link>
        );

        return collapsed ? (
            <Tooltip
                key={item.label}
                label={item.label}
                position="right"
                withArrow
            >
                {linkContent}
            </Tooltip>
        ) : (
            linkContent
        );
    };

    const links = filteredLinks.map((item) => renderNavItem(item));

    return (
        <nav
            className={`${classes.navbar} ${collapsed ? classes.navbarCollapsed : ""}`}
        >
            <Box className={classes.collapseButtonWrapper}>
                <Tooltip
                    label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    position="right"
                    withArrow
                    withinPortal
                >
                    <ActionIcon
                        variant="filled"
                        color="green"
                        onClick={toggleCollapse}
                        size="md"
                        radius="xl"
                        className={classes.collapseButton}
                    >
                        {collapsed ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronLeft size={16} />
                        )}
                    </ActionIcon>
                </Tooltip>
            </Box>
            <div className={classes.navbarMain}>
                <div className={classes.brandSection}>
                    {!collapsed && (
                        <Group
                            align="center"
                            gap="xs"
                            onClick={() => setSwitcherOpen(true)}
                            className={classes.farmSwitcherGroup}
                        >
                            <Box className={classes.logoBox}>
                                {/* <Image src="/logo.png" alt="Logo" width={24} height={24} /> */}
                                <IconPlant2 size={24} />
                            </Box>
                            <Group className={classes.farmInfoGroup}>
                                <Text size="md" fw={800}>
                                    {farmName || "Agriculture Platform"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Switch Farm
                                </Text>
                            </Group>
                            <IconSelector
                                size={22}
                                stroke={1.5}
                                color="gray"
                                className={classes.selectorIcon}
                            />
                        </Group>
                    )}
                    {/* {!collapsed && (
                        <Paper
                            withBorder
                            radius="md"
                            style={{
                                background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                                borderColor: "#86efac",
                                borderWidth: "2px",
                                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.15), 0 0 0 1px rgba(22, 163, 74, 0.05)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.2), 0 0 0 1px rgba(22, 163, 74, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(22, 163, 74, 0.15), 0 0 0 1px rgba(22, 163, 74, 0.05)";
                            }}
                            onClick={() => setSwitcherOpen(true)}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: -10,
                                    right: -10,
                                    width: 60,
                                    height: 60,
                                    background: "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
                                    borderRadius: "50%",
                                }}
                            />
                            
                            <Group gap={12} align="center" wrap="nowrap">
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
                                        flexShrink: 0,
                                    }}
                                >
                                    <IconCircleCheck
                                        size={20}
                                        color="white"
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <div style={{ lineHeight: 1.4, flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                                    <Text 
                                        size="xs" 
                                        fw={700} 
                                        style={{ 
                                            textTransform: "uppercase", 
                                            letterSpacing: "1px", 
                                            fontSize: "9px",
                                            color: "#15803d",
                                            marginBottom: "4px",
                                            opacity: 0.9,
                                        }}
                                    >
                                        My Active Farm
                                    </Text>
                                    <Text 
                                        size="md" 
                                        fw={800}
                                        style={{
                                            color: "#14532d",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontSize: "15px",
                                            lineHeight: "1.2",
                                        }}
                                    >
                                        {farmName || "Agriculture Platform"}
                                    </Text>
                                </div>
                                <ActionIcon
                                    variant="subtle"
                                    color="green"
                                    size="sm"
                                    radius="md"
                                    style={{
                                        flexShrink: 0,
                                        background: "rgba(255, 255, 255, 0.6)",
                                        color: "#15803d",
                                    }}
                                >
                                    <IconChevronRight size={16} />
                                </ActionIcon>
                            </Group>
                        </Paper>
                    )} */}
                    {collapsed && (
                        <Tooltip
                            label={
                                <div>
                                    <Text
                                        size="xs"
                                        fw={700}
                                        style={{
                                            textTransform: "uppercase",
                                            marginBottom: 4,
                                        }}
                                    >
                                        My Active Farm
                                    </Text>
                                    <Text size="sm" fw={600}>
                                        {farmName || "Agriculture Platform"}
                                    </Text>
                                </div>
                            }
                            position="right"
                            withArrow
                        >
                            <ActionIcon
                                variant="filled"
                                color="green"
                                size="xl"
                                radius="md"
                                onClick={() => setSwitcherOpen(true)}
                                style={{
                                    width: "100%",
                                    marginTop: 8,
                                    background:
                                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                    boxShadow:
                                        "0 2px 8px rgba(34, 197, 94, 0.3)",
                                }}
                            >
                                <IconCircleCheck size={22} strokeWidth={2.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </div>
                {/* <Group className={classes.header} justify="space-between">
          {collapsed ? (
            <Tooltip
              label={`${userName || "User"}\n${userEmail || ""}`}
              position="right"
              withArrow
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
                onClick={() => router.push("/settings")}
                style={{ width: "100%" }}
              >
                <Avatar src={userProfilePicture} radius="xl" size={28} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <UserButton />
          )}
        </Group> */}
                <div className={classes.linksSection}>{links}</div>
            </div>

            <div className={classes.footer}>
                <UserButton
                    collapsed={collapsed}
                    handleLogout={() => void handleLogout()}
                />
            </div>

            <FarmSwitcherModal
                opened={switcherOpen}
                onClose={() => setSwitcherOpen(false)}
            />
        </nav>
    );
}

export default NavbarSimple;
