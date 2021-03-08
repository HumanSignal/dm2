import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { fetchTasks } from './actions';
import { Task } from './model';

export const tasksAdapter = createEntityAdapter<Task>();

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState(),
  reducers: {
    create: (state) => {
      state.ids.map(id => `hello-${id}`);
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      tasksAdapter.addMany(state, action.payload);
    });
  },
});

export const taskSelector = tasksAdapter.getSelectors().selectAll;

export const taskActions = {
  ...tasksSlice.actions,
  fetch: fetchTasks
};
