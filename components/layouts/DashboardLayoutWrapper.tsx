"use client";

import React from "react";
import NavbarSimple from "@/components/navigation/NavbarSimple";
import PermissionGate from "@/components/guards/PermissionGate";

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGate>
            <div
                style={{
                    display: "flex",
                    minHeight: "100dvh",
                }}
            >
                <NavbarSimple />
                <div
                    style={{
                        flex: 1,
                        padding: 16,
                        overflow: "auto",
                        backgroundColor: "#f9fafb",
                    }}
                >
                    {children}
                </div>
            </div>
        </PermissionGate>
    );
}

