import { createSlice } from '@reduxjs/toolkit';
import { fetchProject } from './actions';
import { Project } from './model';


const initialState: Project = {

};

export const projectSlice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      console.log('Project fetched', action);

      return {...state, ...action.payload};
    });
  },
});

export const projectSelector = (state) => state.project;

export const projectActions = {
  ...projectSlice.actions,
  fetch: fetchProject
};
