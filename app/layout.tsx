import "@mantine/core/styles.css";
import "./globals.css";

import React from "react";
import {
    ColorSchemeScript,
    mantineHtmlProps,
    MantineProvider,
} from "@mantine/core";
import { QueryProvider } from "@/providers/query-provider";
import AuthSessionProvider from "@/providers/session-provider";
import { theme } from "@/theme";

export const metadata = {
    title: "Farm Management",
    description: "Farm Management System",
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
                            {children}
                        </MantineProvider>
                    </QueryProvider>
                </AuthSessionProvider>
            </body>
        </html>
    );
}
