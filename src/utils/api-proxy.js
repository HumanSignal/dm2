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
 * @typedef {import("./types").Dict} Dict
 */

/**
 * @typedef {Dict<string, EndpointConfig>} Endpoints
 */

/**
 * @typedef {{
 * gateway: string | URL,
 * endpoints: Dict<EndpointConfig>,
 * commonHeaders: Dict<string>,
 * mockDelay: number,
 * mockDisabled: boolean,
 * }} APIProxyOptions
 */

/**
 * Proxy layer for any type of API's
 */
export class APIProxy {
  /** @type {string} */
  gateway = null;

  /** @type {Dict<string>} */
  commonHeaders = {};

  /** @type {number} */
  mockDelay = 0;

  /** @type {boolean} */
  mockDisabled = false;

  /** @type {"same-origin"|"cors"} */
  requestMode = "same-origin";

  /**
   * Constructor
   * @param {APIProxyOptions} options
   */
  constructor(options) {
    this.commonHeaders = options.commonHeaders ?? {};
    this.gateway = this.resolveGateway(options.gateway);
    this.requestMode = this.detectMode();
    this.mockDelay = options.mockDelay ?? 0;
    this.mockDisabled = options.mockDisabled ?? false;

    console.log("API gateway: ", this.gateway);
    this.resolveMethods(options.endpoints);
  }

  /**
   * Resolves gateway to a full URL
   * @returns {string}
   */
  resolveGateway(url) {
    if (url instanceof URL) {
      return url.toString();
    }

    try {
      return new URL(url).toString();
    } catch {
      const gateway = new URL(window.location.href);

      if (url[0] === "/") {
        gateway.pathname = url.replace(/([/])$/, "");
      } else {
        gateway.pathname = `${gateway.pathname}/${url}`
          .replace(/([/]+)/g, "/")
          .replace(/([/])$/, "");
      }
      return gateway.toString();
    }
  }

  /**
   * Detect RequestMode.
   * @returns {"same-origin"|"cors"}
   */
  detectMode() {
    const currentOrigin = window.location.origin;
    const gatewayOrigin = new URL(this.gateway).origin;

    return currentOrigin === gatewayOrigin ? "same-origin" : "cors";
  }

  /**
   * Build methods list from endpoints
   * @private
   */
  resolveMethods(endpoints, parentPath) {
    if (endpoints) {
      const methods = new Map(Object.entries(endpoints));

      methods.forEach((settings, methodName) => {
        const { scope, ...restSettings } = this.getSettings(settings);

        this[methodName] = this.createApiCallExecutor(restSettings, [
          parentPath,
        ]);

        if (scope)
          this.resolveMethods(scope, [
            ...(parentPath ?? []),
            restSettings.path,
          ]);
      });
    }
  }

  /**
   * Actual API call
   * @param {EndpointConfig} settings
   * @private
   */
  createApiCallExecutor(methodSettings, parentPath) {
    return async (urlParams, { headers, body } = {}) => {
      try {
        const requestMethod = (methodSettings.method ?? "get").toUpperCase();
        const apiCallURL = this.createUrl(
          methodSettings.path,
          urlParams ?? {},
          parentPath
        );

        const initialheaders = Object.assign(
          this.getDefaultHeaders(requestMethod),
          methodSettings.headers ?? {},
          headers ?? {}
        );

        const requestHeaders = new Headers(initialheaders);

        const requestParams = {
          method: requestMethod,
          headers: requestHeaders,
          mode: this.requestMode,
          credentials: this.requestMode === "cors" ? "omit" : "same-origin",
        };

        if (requestMethod !== "GET") {
          const contentType = requestHeaders.get("Content-Type");
          console.log({ requestParams, contentType });

          if (contentType === "multipart/form-data") {
            requestParams.body = this.createRequestBody(body);
          } else if (contentType === "application/json") {
            requestParams.body = JSON.stringify(body);
          } else {
            requestParams.body = body;
          }
        }

        /** @type {Response} */
        let rawResponse;

        if (
          methodSettings.mock &&
          process.env.NODE_ENV === "development" &&
          !this.mockDisabled
        ) {
          rawResponse = await this.mockRequest(
            apiCallURL,
            urlParams,
            requestParams,
            methodSettings
          );
        } else {
          rawResponse = await fetch(apiCallURL, requestParams);
        }

        if (rawResponse.ok) {
          const responseData =
            rawResponse.status !== 204
              ? await rawResponse.json()
              : { ok: true };

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
      scope: undefined,
      ...settings,
    };
  }

  getDefaultHeaders(method) {
    switch (method) {
      case "POST":
      case "PATCH":
      case "DELETE": {
        return {
          "Content-Type": "application/json",
        };
      }
      default:
        return {};
    }
  }

  /**
   * Creates a URL from gateway + endpoint path + params
   * @param {string} path
   * @param {Dict} data
   * @private
   */
  createUrl(endpoint, data = {}, parentPath) {
    const url = new URL(this.gateway);
    const usedKeys = [];
    const path = []
      .concat(...(parentPath ?? []), this.resolveEndpoint(endpoint, data))
      .filter((p) => p !== undefined)
      .join("/")
      .replace(/([/]+)/g, "/");

    const processedPath = path.replace(/:([^/]+)/g, (...res) => {
      const key = res[1];
      usedKeys.push(key);
      const result = data[key];

      if (result === undefined) {
        throw new Error(`Can't find key \`${key}\` in data`);
      }

      return result;
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
   * Resolves an endpoint
   * @param {string|Function} endpoint
   * @param {Dict} data
   */
  resolveEndpoint(endpoint, data) {
    if (endpoint instanceof Function) {
      return endpoint(data);
    } else {
      return endpoint;
    }
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
  async generateError(fetchResponse) {
    const result = (async () => {
      try {
        return fetchResponse.json();
      } catch {
        return {};
      }
    })();

    return {
      status: fetchResponse.status,
      error: fetchResponse.statusText,
      response: await result,
    };
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
      console.log("URL params", params);
      console.log("Body:", request);

      try {
        const fakeRequest = new Request(request);

        if (typeof request.body === "string") {
          fakeRequest.body = JSON.parse(request.body);
        }

        response = await settings.mock(url, params ?? {}, fakeRequest);
      } catch (err) {
        console.error(err);
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
      }, this.mockDelay);
    });
  }
}
