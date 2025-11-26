'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

const brandGreen: MantineColorsTuple = [
  '#effef4',
  '#d8fbe5',
  '#b0f6cd',
  '#83efb1',
  '#5de999',
  '#45e488',
  '#35e07e',
  '#26c76a',
  '#18b45c',
  '#009e4c',
];

const brandOrange: MantineColorsTuple = [
  '#fff7ed',
  '#ffebd3',
  '#ffd3a8',
  '#ffb573',
  '#ff9840',
  '#ff861f',
  '#ff7d0c',
  '#e36800',
  '#c75800',
  '#a84600',
];

export const theme = createTheme({
  primaryColor: 'brandGreen',
  colors: {
    brandGreen,
    brandOrange,
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'md',
        variant: 'filled',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        shadow: 'none',
        p: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        shadow: 'none',
        p: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Checkbox: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
});
