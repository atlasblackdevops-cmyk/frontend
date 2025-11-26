import { replaceDynamicParams } from './helpers';

type QueryKeyDynamicParams = {
  USER: { userId: string };
};

export const QUERY_KEYS = {
  USER: 'user:{userId}',
} as const;

export const getQueryKey = <T extends keyof typeof QUERY_KEYS>(
  key: T,
  params?: T extends keyof QueryKeyDynamicParams ? QueryKeyDynamicParams[T] : never
): string => {
  const template: string = QUERY_KEYS[key];
  return replaceDynamicParams(template, params);
};
