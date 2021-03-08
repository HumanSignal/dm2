import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../../../sdk/api";
import { Task } from "./model";

/**
 * Fetch tasks for a particular tab
 */
export const fetchTasks = createAsyncThunk<Task[], number>('tasks/fetch', async (id) => {
  const response = await API().tasks({tabID: id});
  return response.tasks;
});
