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
