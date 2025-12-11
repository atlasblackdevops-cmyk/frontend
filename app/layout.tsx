import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";

// Initialize dayjs locale before Mantine dates components are used
import "@/lib/dayjs";

import React from "react";
import {
    ColorSchemeScript,
    mantineHtmlProps,
    MantineProvider,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { QueryProvider } from "@/providers/query-provider";
import AuthSessionProvider from "@/providers/session-provider";
import { theme } from "@/theme";

export const metadata = {
    title: {
        default: "Agri-Pulse | Farm Management System",
    },
    description: "Comprehensive farm management system for modern agriculture. Manage livestock, crops, finances, and more with AI-powered insights.",
    keywords: [
        "farm management",
        "agriculture",
        "livestock management",
        "crop management",
        "farm finance",
        "agricultural technology",
        "farm software",
        "agtech",
    ],
    publisher: "Agri-Pulse",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXTAUTH_URL || "https://yourdomain.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: process.env.NEXTAUTH_URL || "https://yourdomain.com",
        siteName: "Agri-Pulse",
        title: "Agri-Pulse | Farm Management System",
        description: "Comprehensive farm management system for modern agriculture. Manage livestock, crops, finances, and more with AI-powered insights.",
        images: [
            {
                url: "/assets/images/farm-landing-banner.jpg",
                width: 1200,
                height: 630,
                alt: "Agri-Pulse Farm Management System",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Agri-Pulse | Farm Management System",
        description: "Comprehensive farm management system for modern agriculture.",
        images: ["/assets/images/farm-landing-banner.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    
};

export default function RootLayout({ children }: { children: any }) {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="#" />
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
            </head>
            <body>
                <AuthSessionProvider>
                    <QueryProvider>
                        <MantineProvider
                            defaultColorScheme="light"
                            theme={theme}
                        >
                            <DatesProvider settings={{ firstDayOfWeek: 0 }}>
                                {children}
                            </DatesProvider>
                        </MantineProvider>
                    </QueryProvider>
                </AuthSessionProvider>
            </body>
        </html>
    );
}
