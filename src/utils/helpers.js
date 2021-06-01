import { toCamelCase } from 'strman';
import { isDefined } from './utils';

export const formDataToJPO = (formData) => {
  if (formData instanceof FormData === false) return formData;

  return Array.from(formData.entries()).reduce((res, [key, value]) => {
    return { ...res, [key]: value };
  }, {});
};

export const objectToMap = (object) => {
  return new Map(Object.entries(object ?? {}));
};

export const mapToObject = (map) => {
  return Object.fromEntries(map);
};

export const filename = (string) => {
  if (string) {
    return string.split('/').slice(-1)[0].match(/([^?]+)/g)?.[0] ?? string;
  }
};

export const camelizeKeys = (object) => {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      return [toCamelCase(key), camelizeKeys(value)];
    } else {
      return [toCamelCase(key), value];
    }
  }));
};

export const hasProperties = (obj, properties, all) => {
  if (!isDefined(obj)) return false;

  return all ? properties.reduce((res, prop) => {
    return res && Object.prototype.hasOwnProperty.call(obj, prop);
  }, true) : (properties.findIndex((prop) => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }) >= 0);
};
