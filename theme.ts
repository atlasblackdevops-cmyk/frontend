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
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "14px",
                },
                error: {
                    fontSize: "12px",
                },
            },
        },
        PasswordInput: {
            defaultProps: {
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "14px",
                },
                error: {
                    fontSize: "12px",
                },
            },
        },
        NumberInput: {
            defaultProps: {
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "14px",
                    paddingRight: "36px",
                },
                error: {
                    fontSize: "12px",
                },
                wrapper: {
                    position: "relative",
                },
                controls: {
                    width: "32px",
                    height: "36px",
                    top: "1px",
                    right: "1px",
                    borderLeft: "1px solid var(--mantine-color-gray-3)",
                },
                control: {
                    border: "none",
                    height: "18px",
                    minHeight: "18px",
                    "&:not(:disabled):hover": {
                        backgroundColor: "var(--mantine-color-gray-1)",
                    },
                },
            },
        },
        Select: {
            defaultProps: {
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "14px",
                },
                error: {
                    fontSize: "12px",
                },
                dropdown: {
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                option: {
                    fontSize: "14px",
                },
            },
        },
        DateInput: {
            defaultProps: {
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "14px",
                },
                error: {
                    fontSize: "12px",
                },
                day: {
                    fontSize: "14px",
                },
            },
        },
        Textarea: {
            defaultProps: {
                radius: 6,
                size: "md",
            },
            styles: {
                label: {
                    fontSize: "14px",
                },
                input: {
                    fontSize: "14px",
                },
                error: {
                    fontSize: "12px",
                },
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
