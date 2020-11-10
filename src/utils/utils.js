/**
 * Returns true if all checks return true
 * @param {boolean[]} boolArray
 * @param {(any) => boolean} check
 */
export const all = (boolArray, check) => {
  return boolArray.reduce((res, value) => {
    return res && !!check(value);
  }, true);
};

/**
 * Returns true if any of the checks return true
 * @param {boolean[]} boolArray
 * @param {(any) => boolean} check
 */
export const any = (boolArray, check) => {
  return boolArray.find((value) => !!check(value)) || false;
};

export const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

export const groupBy = (list, group) => {
  return list.reduce((res, item) => {
    const property = group(item);

    if (res[property]) {
      res[property].push(item);
    } else {
      res[property] = [item];
    }

    return res;
  }, {});
};

export const unique = (list) => {
  return Array.from(new Set(list));
};

export const cleanArray = (array) => {
  return array.filter((el) => !!el);
};
