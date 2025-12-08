"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";

const brandGreen: MantineColorsTuple = [
    "#f0fdf4",
    "#dcfce7",
    "#bbf7d0",
    "#86efac",
    "#4ade80",
    "#22c55e",
    "#16a34a",
    "#15803d",
    "#166534",
    "#14532d",
];

const brandOrange: MantineColorsTuple = [
    "#fff7ed",
    "#ffebd3",
    "#ffd3a8",
    "#ffb573",
    "#ff9840",
    "#ff861f",
    "#ff7d0c",
    "#e36800",
    "#c75800",
    "#a84600",
];

export const theme = createTheme({
    primaryColor: "brandGreen",
    colors: {
        brandGreen,
        brandOrange,
    },
    defaultRadius: "md",
    components: {
        Button: {
            defaultProps: {
                radius: 6,
                variant: "filled",
                styles: {
                    root: {
                        height: 42,
                        minHeight: 42,
                        fontSize: 15,
                    },
                },
            },
        },
        Paper: {
            defaultProps: {
                radius: "md",
                withBorder: true,
                shadow: "none",
                p: "md",
            },
        },
        Card: {
            defaultProps: {
                radius: "md",
                withBorder: true,
                shadow: "none",
                p: "md",
            },
        },
        TextInput: {
            defaultProps: {
                radius: "md",
            },
        },
        PasswordInput: {
            defaultProps: {
                radius: "md",
            },
        },
        Checkbox: {
            defaultProps: {
                radius: "sm",
            },
        },
        Table: {
            defaultProps: {
                highlightOnHover: true,
                verticalSpacing: 0,
            },
            styles: {
                th: {
                    paddingLeft: 16,
                    paddingRight: 2,
                    paddingTop: 10,
                    paddingBottom: 10,
                    whiteSpace: "nowrap",
                },
                td: {
                    paddingLeft: 16,
                    paddingRight: 2,
                    paddingTop: 10,
                    paddingBottom: 10,
                    whiteSpace: "nowrap",
                    minHeight: 46,
                },
            },
        },
    },
});
