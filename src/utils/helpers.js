export const formDataToJPO = (formData) => {
  if (formData instanceof FormData === false) return formData;

  return Array.from(formData.entries()).reduce((res, [key, value]) => {
    return { ...res, [key]: value };
  }, {});
};
