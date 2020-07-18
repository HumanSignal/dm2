export default [{
    title: "Tasks",
  fields: [
      // tasks
      { title: "ID", accessor: 'id', source: "tasks", enabled: true },
      { title: "Status", accessor: 'status', source: "tasks", enabled: true },
      
      // annotations
      { title: "ID", source: "annotations", enabled: true, canToggle: false },
      { title: "Status", source: "annotations", enabled: true, canToggle: false },
      { title: "Created On", source: "annotations", enabled: true },
      { title: "Updated On", source: "annotations", enabled: true },
      { title: "Author", source: "annotations", enabled: true },
      { title: "Regions #", source: "annotations", enabled: true },
      
      // add some file fields
  ]
}];
