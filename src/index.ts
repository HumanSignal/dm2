// @ts-ignore
import { DataManager } from "./sdk";

const _dataManager = DataManager;

if (process.env.NODE_ENV === "development" && !process.env.BUILD_NO_SERVER) {
  // @ts-ignore
  import("./dev").then(({ initDevApp }) => initDevApp(_dataManager));
}
export default _dataManager;
