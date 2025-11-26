import { isNil, isNull, isUndefined, omitBy } from 'lodash';

export const replaceDynamicParams = (template: string, params?: Record<string, string>): string => {
  if (!params) {
    return template;
  }
  Object.keys(params).forEach((placeholder) => {
    const value = params[placeholder];
    const regex = new RegExp(`{${placeholder}}`, 'g');
    template = template.replace(regex, value);
  });
  return template;
};

export const cleanObject = <T extends object>(obj: T) => {
  return omitBy(obj, (value) => !value || isNil(value) || isUndefined(value) || isNull(value));
};

export const isPrivateOrAdminRoute = (routes: string[], pathname: string) => {
  return routes.some((route) => {
    // CREATE A REGEX PATTERN FROM THE PROTECTED ROUTE, REPLACING DYNAMIC PARTS WITH REGEX PATTERNS
    const pattern = route.replace(/\[([^\]]+)\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
};

export const parseJSON = <T>(payload: string): T => {
  return JSON.parse(payload) as T;
};
