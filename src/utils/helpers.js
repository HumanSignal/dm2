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
