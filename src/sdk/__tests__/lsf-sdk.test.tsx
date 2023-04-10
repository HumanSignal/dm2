import { adjacentTaskIds } from "../lsf-utils";

describe("adjacentTaskIds", () => { 
  const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  it("should return adjacent id's", async () => {
    const adjacent = adjacentTaskIds(3,tasks);

    expect(adjacent).toEqual({ prevTaskId: 2, nextTaskId: 4 });
  });
  it("should return undefined for the tasks out of bounds", async () => {
    const adjacentStart = adjacentTaskIds(1, tasks);

    expect(adjacentStart).toEqual({ prevTaskId: undefined, nextTaskId: 2 });

    const adjacentEnd = adjacentTaskIds(5, tasks);

    expect(adjacentEnd).toEqual({ prevTaskId: 4, nextTaskId: undefined });
  });
  it("should return undefined for both if current task is not found in list", async () => {
    const adjacent = adjacentTaskIds(3,[]);

    expect(adjacent).toEqual({ prevTaskId: undefined, nextTaskId: undefined });
  });
});