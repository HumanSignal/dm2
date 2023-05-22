import { adjacentTaskIds, findInterfaces } from "../lsf-utils";

describe("adjacentTaskIds", () => { 
  const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  it("should return adjacent id's", async () => {
    const adjacent = adjacentTaskIds(tasks, 3);

    expect(adjacent).toEqual({ prevTaskId: 2, nextTaskId: 4 });
  });
  it("should return undefined for the tasks out of bounds", async () => {
    const adjacentStart = adjacentTaskIds(tasks, 1);

    expect(adjacentStart).toEqual({ prevTaskId: undefined, nextTaskId: 2 });

    const adjacentEnd = adjacentTaskIds(tasks, 5);

    expect(adjacentEnd).toEqual({ prevTaskId: 4, nextTaskId: undefined });
  });
  it("should return undefined for both if current task is not found in list", async () => {
    const adjacent = adjacentTaskIds([], 3);

    expect(adjacent).toEqual({ prevTaskId: undefined, nextTaskId: undefined });
  });
});


describe('findInterfaces', () => {

  test('adds annotations:deny-empty interface when project.enable_empty_annotation is false', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'ANNOTATOR', () => true);

    expect(interfaces).toContain('annotations:deny-empty');
  });

  test('adds infobar, topbar:prev-next-history and skip interfaces when labelStream is truthy and project.show_skip_button is true', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, true, { hasInterface: () => false }, 'ANNOTATOR', () => true);

    expect(interfaces).toEqual(expect.arrayContaining(['infobar', 'topbar:prev-next-history', 'skip']));
  });

  test('adds comments:update interface when FF_DEV_2186 is truthy and project.review_settings.require_comment_on_reject is true', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true, review_settings: { require_comment_on_reject: true } }, true, { hasInterface: () => false }, 'ANNOTATOR', () => true);

    expect(interfaces).toContain('comments:update');
  });

  test('adds instruction interface when datamanager hasInterface returns true for instruction', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: (iface) => iface === 'instruction' }, 'ANNOTATOR', () => true);

    expect(interfaces).toContain('instruction');
  });

  test('adds ground-truth interface when labelStream is falsy and datamanager hasInterface returns true for groundTruth', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: (iface) => iface === 'groundTruth' }, 'ANNOTATOR', () => true);

    expect(interfaces).toContain('ground-truth');
  });

  test('adds auto-annotation interface when datamanager hasInterface returns true for autoAnnotation', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: (iface) => iface === 'autoAnnotation' }, 'ANNOTATOR', () => true);

    expect(interfaces).toContain('auto-annotation');
  });

  test('adds annotations:view-all and annotations:add-new interfaces when role is "ADMIN" and labelStream is falsy', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'ADMIN', () => false);

    expect(interfaces).toEqual(expect.arrayContaining(['annotations:view-all', 'annotations:add-new']));
  });

  test('adds annotations:view-all and annotations:add-new interfaces when role is "MANAGER" and labelStream is falsy', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'MANAGER', () => false);

    expect(interfaces).toEqual(expect.arrayContaining(['annotations:view-all', 'annotations:add-new']));
  });
  test('adds annotations:view-all and annotations:add-new interfaces when role is "ADMIN" and labelStream is falsy', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'ADMIN', () => false);

    expect(interfaces).toEqual(expect.arrayContaining(['annotations:view-all', 'annotations:add-new']));
  });
  test('adds annotations:view-all and annotations:add-new interfaces when role is "OWNER" and labelStream is falsy', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'OWNER', () => false);

    expect(interfaces).toEqual(expect.arrayContaining(['annotations:view-all', 'annotations:add-new']));
  });
  test('adds annotations:view-all and annotations:add-new interfaces when role is empty (open source)', () => {
    const interfaces = findInterfaces({ enable_empty_annotation: false, show_skip_button: true }, null, { hasInterface: () => false }, 'OWNER', () => true);

    expect(interfaces).toEqual(expect.arrayContaining(['annotations:view-all', 'annotations:add-new']));
  });
});