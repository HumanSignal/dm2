const { REACT_APP_USE_LSB, REACT_APP_GATEWAY_API } = process.env;

/**
 * @param {import("../src/sdk/dm-sdk").DataManager} DataManager
 */
export const initDevApp = async (DataManager) => {
  const useExternalSource = !!REACT_APP_USE_LSB || !!REACT_APP_GATEWAY_API;
  const gatewayAPI = REACT_APP_GATEWAY_API ?? "http://localhost:8080/api";

  console.log("Running in development", {
    REACT_APP_USE_LSB,
    REACT_APP_GATEWAY_API,
  });

  const datamanager = new DataManager({
    root: document.getElementById("app"),
    apiGateway: gatewayAPI,
    apiMockDisabled: useExternalSource,
    labelStudio: {
      user: {
        pk: 1,
        firstName: "James",
        lastName: "Dean",
      },
    },
    table: {
      hiddenColumns: {
        explore: ["tasks:completed_at", "tasks:data"],
      },
      visibleColumns: {
        labeling: [
          "tasks:id",
          "tasks:was_cancelled",
          "tasks:data.image",
          "tasks:data.text",
          "annotations:id",
          "annotations:task_id",
        ],
      },
    },
  });

  datamanager.on("submitCompletion", (...args) =>
    console.log("submitCompletion", args)
  );

  datamanager.on("updateCompletion", (...args) =>
    console.log("updateCompletion", args)
  );
};
