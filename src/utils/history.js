import { isDefined } from "./utils";

export const History = {
  getParams(urlInstance) {
    const url = urlInstance ?? new URL(window.location.href);
    const result = {};

    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  },

  setParams(params = {}) {
    const url = new URL(window.location.href);
    const { searchParams } = url;

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });

    return url;
  },

  navigate(params = {}, replace = false) {
    const url = this.setParams(params);
    const title = document.title;
    const state = this.getParams(url);

    if (replace) {
      window.history.replaceState(state, title, url.toString());
    } else {
      window.history.pushState(state, title, url.toString());
    }
  },

  forceNavigate(params = {}, replace = false) {
    const resultParams = params ?? {};

    Object.entries(this.getParams()).forEach(([key]) => {
      if (!isDefined(resultParams[key])) {
        resultParams[key] = null;
      }
    });

    this.navigate(resultParams, replace);
  },
};
