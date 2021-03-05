import { DataManager } from "./sdk";

if (process.env.NODE_ENV === "development" && !process.env.BUILD_MODULE) {
  import("./dev").then(({ initDevApp }) => initDevApp(DataManager));
}

export default DataManager;
