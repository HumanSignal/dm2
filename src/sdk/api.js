import { APIProxy } from "../utils/api-proxy";

let _instance;

export const API = (...args) => {
  return _instance = _instance ?? new APIProxy(...args);
};

