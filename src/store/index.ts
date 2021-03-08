import { combineReducers } from "redux";
import { RootStore } from "./RootStore";
import { projectSlice } from "./slices/project";
import { tasksSlice } from "./slices/tasks";

export const reducers = combineReducers<RootStore>({
  tasks: tasksSlice.reducer,
  project: projectSlice.reducer
});
