import { EntityAdapter } from "@reduxjs/toolkit";
import { Project } from "./slices/project/model";
import { Task } from "./slices/tasks/model";


export interface RootStore {
  tasks: EntityAdapter<Task>,
  project: Project
}
