"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
    IconCpu,
    IconCurrencyDollar,
    IconDeer,
    IconLayoutDashboard,
    IconLogout,
    IconPlant2,
    IconSettings,
    IconShoppingCart,
    IconSwitchHorizontal,
    IconUsersGroup,
    IconMapPin,
    IconChevronDown,
    IconChevronRight,
    IconSeeding,
    IconCircleCheck,
    IconChevronLeft,
} from "@tabler/icons-react";
import { Group, Text, Collapse, Paper, ActionIcon, Tooltip, Avatar } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import FarmSwitcherModal from "@/components/farm/FarmSwitcherModal";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/use-auth-store";
import { hasRoutePermission } from "@/lib/permissions";
import { UserButton } from "./UserButton";
import classes from "./NavbarSimple.module.css";

interface NavItem {
    link: string;
    label: string;
    icon: React.ComponentType<{ className?: string; stroke?: number }>;
    children?: NavItem[];
}

const data: NavItem[] = [
    { link: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { link: "/fields", label: "Fields", icon: IconMapPin },
    { link: "/livestock", label: "Livestock", icon: IconDeer },
    {
        link: "/crops",
        label: "Crops",
        icon: IconPlant2,
        children: [
            { link: "/crops/planting", label: "Planting", icon: IconSeeding },
        ],
    },
    { link: "/finance", label: "Finance", icon: IconCurrencyDollar },
    { link: "/marketplace", label: "Marketplace", icon: IconShoppingCart },
    { link: "/ai", label: "AI", icon: IconCpu },
    { link: "/settings", label: "Settings", icon: IconSettings },
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
            setRoleAndFarm({ role: null, hasFarm: null, farmId: null, farmName: null });
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
            return children.some((child) => pathname === child.link || pathname.startsWith(child.link + "/"));
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
        const hasActiveChild = item.children?.some((child) => pathname === child.link || pathname.startsWith(child.link + "/"));

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
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && (
                        isExpanded ? (
                            <IconChevronDown size={16} className={classes.linkIcon} />
                        ) : (
                            <IconChevronRight size={16} className={classes.linkIcon} />
                        )
                    )}
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
                                    const isChildActive = pathname === child.link || pathname.startsWith(child.link + "/");
                                    return (
                                        <Link
                                            href={child.link}
                                            key={child.label}
                                            className={classes.sublink}
                                            data-active={isChildActive || undefined}
                                        >
                                            <child.icon className={classes.linkIcon} stroke={1.5} />
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
            <Tooltip key={item.label} label={item.label} position="right" withArrow>
                {linkContent}
            </Tooltip>
        ) : (
            linkContent
        );
    };

    const links = filteredLinks.map((item) => renderNavItem(item));

    return (
        <nav className={`${classes.navbar} ${collapsed ? classes.navbarCollapsed : ""}`}>
            <div className={classes.collapseButtonWrapper}>
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
                        {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
                    </ActionIcon>
                </Tooltip>
            </div>
            <div className={classes.navbarMain}>
                <div className={classes.brandSection}>
                    
                    {!collapsed && (
                        <Paper
                            withBorder
                            radius="md"
                            p={12}
                            style={{
                                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                                borderColor: "#d1fae5",
                                boxShadow: "0 1px 3px rgba(22, 163, 74, 0.1)",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 2px 6px rgba(22, 163, 74, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(22, 163, 74, 0.1)";
                            }}
                            onClick={() => setSwitcherOpen(true)}
                        >
                            <Group gap={10} align="flex-start" wrap="nowrap">
                                <div
                                    style={{
                                        background: "white",
                                        borderRadius: "6px",
                                        padding: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                                    }}
                                >
                                    <IconCircleCheck
                                        size={16}
                                        color="var(--mantine-color-green-6)"
                                    />
                                </div>
                                <div style={{ lineHeight: 1.3, flex: 1, minWidth: 0 }}>
                                    <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "10px" }}>
                                        Active farm
                                    </Text>
                                    <Text 
                                        size="sm" 
                                        fw={700}
                                        style={{
                                            color: "#15803d",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {farmName || "Agriculture Platform"}
                                    </Text>
                                </div>
                            </Group>
                        </Paper>
                    )}
                    {collapsed && (
                        <Tooltip label={farmName || "Agriculture Platform"} position="right" withArrow>
                            <ActionIcon
                                variant="light"
                                color="green"
                                size="xl"
                                radius="md"
                                onClick={() => setSwitcherOpen(true)}
                                style={{
                                    width: "100%",
                                    marginTop: 8,
                                }}
                            >
                                <IconCircleCheck size={20} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </div>
                <Group className={classes.header} justify="space-between">
                    {collapsed ? (
                        <Tooltip label={`${userName || "User"}\n${userEmail || ""}`} position="right" withArrow>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="lg"
                                radius="md"
                                onClick={() => router.push("/settings")}
                                style={{ width: "100%" }}
                            >
                                <Avatar
                                    src={userProfilePicture}
                                    radius="xl"
                                    size={28}
                                />
                            </ActionIcon>
                        </Tooltip>
                    ) : (
                        <UserButton />
                    )}
                </Group>
                <div className={classes.linksSection}>{links}</div>
            </div>

            <div className={classes.footer}>
                {collapsed ? (
                    <>
                        <Tooltip label="Switch Farm" position="right" withArrow>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="lg"
                                radius="md"
                                onClick={() => setSwitcherOpen(true)}
                                style={{ width: "100%", marginBottom: 8 }}
                            >
                                <IconSwitchHorizontal size={18} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Logout" position="right" withArrow>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="lg"
                                radius="md"
                                onClick={() => void handleLogout()}
                                loading={logoutLoading}
                                style={{ width: "100%" }}
                            >
                                <IconLogout size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <a
                            href="#"
                            className={classes.link}
                            onClick={(event) => {
                                event.preventDefault();
                                setSwitcherOpen(true);
                            }}
                            style={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "#374151",
                            }}
                        >
                            <Group gap="xs" style={{ flex: 1 }}>
                                <IconSwitchHorizontal
                                    className={classes.linkIcon}
                                    stroke={1.8}
                                />
                                <span>Switch Farm</span>
                            </Group>
                            {farmName && (
                                <Text
                                    size="xs"
                                    style={{
                                        marginLeft: "8px",
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        background: "white",
                                        color: "#6b7280",
                                        fontWeight: 600,
                                        border: "1px solid #e5e7eb",
                                        fontSize: "11px",
                                    }}
                                >
                                    {farmName}
                                </Text>
                            )}
                        </a>
                        <a
                            href="#"
                            className={classes.link}
                            onClick={(event) => {
                                event.preventDefault();
                                void handleLogout();
                            }}
                            style={{
                                opacity: logoutLoading ? 0.6 : 1,
                                cursor: logoutLoading ? "wait" : "pointer",
                                color: logoutLoading ? "#9ca3af" : "#dc2626",
                            }}
                        >
                            <IconLogout className={classes.linkIcon} stroke={1.8} />
                            <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
                        </a>
                    </>
                )}
            </div>

            <FarmSwitcherModal
                opened={switcherOpen}
                onClose={() => setSwitcherOpen(false)}
            />
        </nav>
    );
}

export default NavbarSimple;
