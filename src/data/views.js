export default [{
  title: "Tasks",
  fields: [
      // tasks
      { field: "id", source: "tasks", enabled: true, filterState: { numValue: 0 } },
      { field: "task_status", source: "tasks", enabled: true, canToggle: true, filterState: { stringValue: "All" } },
      { field: "annotations", source: "tasks", enabled: true, canToggle: true },
      { field: "created", source: "tasks", enabled: true, canToggle: true },
      
      // annotations
      { field: "id", source: "annotations", enabled: true, canToggle: false },
      { field: "annotation_status", source: "annotations", enabled: true, canToggle: false },
      { field: "created", source: "annotations", enabled: true, canToggle: true },
      { field: "updated", source: "annotations", enabled: true },
      { field: "author", source: "annotations", enabled: true },
      { field: "regions", source: "annotations", enabled: true },
      
      // add some file fields
  ]
}];
