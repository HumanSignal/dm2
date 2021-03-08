import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../../../sdk/api";
import { Project } from "./model";

export const fetchProject = createAsyncThunk<Project, number>('project/fetch', async (id) => {
  const response = await API().project({project: id}) as Project;
  return response;
});
