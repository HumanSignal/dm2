export const History = {
  getParams() {
    const url = new URL(window.location.href);
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

    return url.toString();
  },

  navigate(params = {}, replace = false) {
    const url = this.setParams(params);
    const title = document.title;

    if (replace) {
      window.history.replaceState(params, title, url);
    } else {
      window.history.pushState(params, title, url);
    }
  },
};
