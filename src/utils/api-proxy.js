/**
 * @typedef {string | {
 * path: string,
 * method: RequestMethod,
 * convert: ResponseConverter,
 * mock: (url: string, request: Request) => Dict
 * body: Dict,
 * headers: Headers,
 * }} EndpointConfig
 */

/**
 * @typedef {Map<string, EndpointConfig>} Endpoints
 */

/**
 * @typedef {{
 * gateway: string | URL,
 * endpoints: Dict<EndpointConfig>,
 * commonHeaders: Dict<string>,
 * }} APIProxyOptions
 */

/**
 * Proxy layer for any type of API's
 */
export class APIProxy {
  /** @type {string} */
  gateway = null;

  /** @type {Endpoints} */
  endpoints = new Map();

  /** @type {Dict<string>} */
  commonHeaders = {};

  /**
   * Constructor
   * @param {APIProxyOptions} options
   */
  constructor(options) {
    this.commonHeaders = options.commonHeaders ?? {};
    this.gateway = this.buildGateway(options.gateway);
    this.endpoints = new Map(Object.entries(options.endpoints));
    console.log(`API gateway: ${this.gateway}`);

    this.buildMethods();
  }

  /**
   *
   */
  buildGateway(url) {
    if (url instanceof URL) {
      console.log("Gateway built from URL");
      return url.toString();
    }

    try {
      return new URL(url).toString();
    } catch {
      console.log("Gateway built from location");
      const gateway = new URL(window.location.href);
      gateway.pathname = url;
      return gateway.toString();
    }
  }

  /**
   * Build methods list from endpoints
   * @private
   */
  buildMethods() {
    this.endpoints.forEach((settings, methodName) => {
      this[methodName] = this.createApiCallExecutor(settings);
    });
  }

  /**
   * Actual API call
   * @param {EndpointConfig} settings
   * @private
   */
  createApiCallExecutor(settings) {
    return async (urlParams, { headers, body } = {}) => {
      try {
        const methodSettings = this.getSettings(settings);
        const requestMethod = (methodSettings.method ?? "get").toUpperCase();
        const apiCallURL = this.createUrl(methodSettings.path, urlParams ?? {});

        const request = new Request(apiCallURL, {
          method: requestMethod,
          headers: Object.assign(
            {},
            methodSettings.headers ?? {},
            headers ?? {}
          ),
        });

        if (requestMethod !== "GET") {
          const contentType = request.headers["ContentType"];

          if (contentType === "multipart/form-data") {
            request.body = this.createRequestBody(body);
          } else if (contentType === "application/json") {
            request.body = JSON.stringify(body);
          } else {
            request.body = body;
          }
        }

        let rawResponse;

        if (methodSettings.mock && process.env.NODE_ENV === "development") {
          rawResponse = await this.mockRequest(
            apiCallURL,
            urlParams,
            request,
            methodSettings
          );
        } else {
          rawResponse = await fetch(request);
        }

        if (rawResponse.ok) {
          const responseData = await rawResponse.json();

          if (methodSettings.convert instanceof Function) {
            return await methodSettings.convert(responseData);
          }

          return responseData;
        } else {
          return this.generateError(rawResponse);
        }
      } catch (exception) {
        return this.generateException(exception);
      }
    };
  }

  /**
   * Retrieve method-specific settings
   * @private
   * @param {EndpointConfig} settings
   * @returns {EndpointConfig}
   */
  getSettings(settings) {
    if (typeof settings === "string") {
      settings = {
        path: settings,
      };
    }

    return {
      method: "GET",
      mock: undefined,
      convert: undefined,
      ...settings,
    };
  }

  /**
   * Creates a URL from gateway + endpoint path + params
   * @param {string} path
   * @param {Dict} data
   * @private
   */
  createUrl(path, data = {}) {
    const url = new URL(this.gateway);
    const usedKeys = [];

    const processedPath = path.replace(/:([^/]+)/g, (...res) => {
      const key = res[1];
      usedKeys.push(key);
      return data[key] ?? `[can't find key \`${key}\` in data]`;
    });

    url.pathname += processedPath;

    if (data && typeof data === "object") {
      Object.entries(data).forEach(([key, value]) => {
        if (!usedKeys.includes(key)) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }

  /**
   * Create FormData object from raw JS object
   * @private
   * @param {Dict} body
   */
  createRequestBody(body) {
    const formData = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  }

  /**
   * Generates an error from a Response object
   * @param {Response} fetchResponse
   * @private
   */
  generateError(fetchResponse) {
    return { error: fetchResponse.statusText };
  }

  /**
   * Generates an error from a caught exception
   * @param {Error} exception
   * @private
   */
  generateException(exception) {
    console.error(exception);
    return { error: exception.message };
  }

  /**
   * Emulate server call
   * @param {string} url
   * @param {Request} params
   * @param {EndpointConfig} settings
   */
  mockRequest(url, params, request, settings) {
    return new Promise(async (resolve) => {
      let response = null;
      let ok = true;

      const groupName = `Mock [${settings.method.toUpperCase()}: ${url}]`;
      console.groupCollapsed(groupName);

      try {
        response = await settings.mock(url, params ?? {}, request);
      } catch {
        ok = false;
      }
      console.log("Response:", response);

      console.groupEnd(groupName);

      setTimeout(() => {
        resolve({
          ok,
          json() {
            return Promise.resolve(response);
          },
        });
      }, 200);
    });
  }
}
