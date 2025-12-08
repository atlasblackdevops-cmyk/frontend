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
} from "@tabler/icons-react";
import { Group, Text, Collapse, Paper } from "@mantine/core";
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
    } = useAuth();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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
            return (
                <div key={item.label}>
                    <a
                        href="#"
                        className={classes.link}
                        data-active={isActive || undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            toggleMenu(item.link);
                        }}
                    >
                        <item.icon className={classes.linkIcon} stroke={1.5} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {isExpanded ? (
                            <IconChevronDown size={16} className={classes.linkIcon} />
                        ) : (
                            <IconChevronRight size={16} className={classes.linkIcon} />
                        )}
                    </a>
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
                </div>
            );
        }

        return (
            <Link
                href={item.link}
                key={item.label}
                className={classes.link}
                data-active={isActive || undefined}
            >
                <item.icon className={classes.linkIcon} stroke={1.5} />
                <span>{item.label}</span>
            </Link>
        );
    };

    const links = filteredLinks.map((item) => renderNavItem(item));

    return (
        <nav className={classes.navbar}>
            <div className={classes.navbarMain}>
                <div className={classes.brandSection}>
                    <Text
                        size="lg"
                        fw={600}
                        c="dark.8"
                        style={{
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Farm Management
                    </Text>
                    <Paper
                        withBorder
                        radius="md"
                        p="sm"
                        style={{
                            marginTop: 6,
                            background: "var(--mantine-color-gray-0)",
                        }}
                    >
                        <Group gap={8} align="flex-start">
                            <IconMapPin
                                size={18}
                                color="var(--mantine-color-green-6)"
                                style={{ marginTop: 2 }}
                            />
                            <div style={{ lineHeight: 1.2 }}>
                                <Text size="xs" c="dimmed" fw={600}>
                                    Active farm
                                </Text>
                                <Text size="sm" fw={600}>
                                    {farmName || "Agriculture Platform"}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                </div>
                <Group className={classes.header} justify="space-between">
                    <UserButton />
                </Group>
                <div className={classes.linksSection}>{links}</div>
            </div>

            <div className={classes.footer}>
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
                            c="dimmed"
                            style={{
                                marginLeft: "8px",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: "#f3f4f6",
                                color: "#6b7280",
                                fontWeight: 500,
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
            </div>

            <FarmSwitcherModal
                opened={switcherOpen}
                onClose={() => setSwitcherOpen(false)}
            />
        </nav>
    );
}

export default NavbarSimple;
