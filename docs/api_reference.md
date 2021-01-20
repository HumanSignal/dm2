# API Reference

DataManager uses LabelStudio API to operate.

## `/project`

### **GET**

Information about current project

Response

```json
{
  "available_storages": [
    [
      "s3",
      "Amazon S3"
    ],
    [
      "s3-completions",
      "Amazon S3"
    ],
    [
      "gcs",
      "Google Cloud Storage"
    ],
    [
      "gcs-completions",
      "Google Cloud Storage"
    ],
    [
      "completions-dir",
      "Local [completions are in \"completions\" directory]"
    ],
    [
      "tasks-json",
      "Local [loading tasks from \"tasks.json\" file]"
    ]
  ],
  "can_delete_tasks": true,
  "can_manage_completions": true,
  "can_manage_tasks": true,
  "completion_count": 1,
  "config": {
    "allow_delete_completions": true,
    "debug": false,
    "description": "default",
    "editor": {
      "debug": false
    },
    "host": "0.0.0.0",
    "input_path": "tasks.json",
    "instruction": "<img src='static/images/ls_logo.png'><br> Type some <b>hypertext</b> for annotators here!<br> <a href='https://labelstud.io/guide/labeling.html'>Read more</a> about the labeling interface.",
    "label_config": "config.xml",
    "label_config_updated": true,
    "ml_backends": [],
    "output_dir": "completions",
    "port": 8081,
    "protocol": "http://",
    "sampling": "sequential",
    "show_project_links_in_multisession": true,
    "source": {
      "name": "Tasks",
      "path": "tasks.json",
      "type": "tasks-json"
    },
    "target": {
      "name": "Completions",
      "path": "completions",
      "type": "completions-dir"
    },
    "task_page_auto_update_timer": 10000,
    "templates_dir": "examples",
    "title": "Label Studio"
  },
  "config_has_control_tags": true,
  "data_types": {
    "image": "Image"
  },
  "instruction": "<img src='static/images/ls_logo.png'><br> Type some <b>hypertext</b> for annotators here!<br> <a href='https://labelstud.io/guide/labeling.html'>Read more</a> about the labeling interface.",
  "label_config_line": "<View>  <Image name=\"image\" value=\"$image\"/>  <BrushLabels name=\"tag\" toName=\"image\">    <Label value=\"Planet\" background=\"rgba(0, 0, 255, 0.7)\"/>    <Label value=\"Moonwalker\" background=\"rgba(255, 0, 0, 0.7)\"/>  </BrushLabels></View>",
  "multi_session_mode": false,
  "project_name": "./my_project",
  "source_storage": {
    "readable_path": "././my_project/tasks.json"
  },
  "source_syncing": false,
  "target_storage": {
    "readable_path": "././my_project/completions"
  },
  "target_syncing": false,
  "task_count": 100
}
```

---

## `/project/columns`

### **GET**

Information about columns of the dataset

#### Response

| Parameter                             | Type        | Description
| -----------                           | ----------- | ------------
| `columns`                             | column[]    | List of columns
| `column.id`                           | `string`    | Column identifier
| `column.parent`                       | `string`    | Parent identifier
| `column.target`                       | `tasks|annotations`    | Entity the column is attached to
| `column.title`                        | `string`    | Human readable title
| `column.type`                         | `string`    | Column value type
| `column.children`                     | `string`    | Column identifier
| `column.visibility_defaults`          | `dict`      | Column identifier
| `column.visibility_defaults.explore`  | `boolean`      | Should the column be visible in the list view by default
| `column.visibility_defaults.labeling` | `boolean`      | Should the column be visible in the labeling view by default

#### Example

```json
{
  "columns": [
    {
      "id": "image",
      "parent": "data",
      "target": "tasks",
      "title": "image",
      "type": "Image",
      "visibility_defaults": {
        "explore": true,
        "labeling": true
      }
    },
    {
      "children": [
        "image"
      ],
      "id": "data",
      "target": "tasks",
      "title": "data",
      "type": "List"
    }
  ]
}
```

---

## `/project/tabs`

### **GET**

Information about tabs in current project

---

## `/project/tabs/:tabID`

### **POST**

Create tab or update existing one

---

### **DELETE**

Delete specific tab

---

## `/project/tabs/:tabID/tasks`

### **GET**

Pages set of samples in the dataset

---

## `/tasks/:taskID`

### **GET**

Returns a specific task

---

## `/project/next`

### **GET**

According to sampling settings returns next task in the dataset

---

## `/project/tabs/:tabID/annotations`

### **GET**

Annotations for the current dataset

---

## `/tasks/:taskID/completions`

### **GET**

Completions for the current dataset

### **POST** `[was_skipped=true]`

If `was_skipped` parameter is passed, creates a completion marked as rejected

---

## `/tasks/:taskID/completions/:id`

### **GET**

Get a completion for a specific task

### **POST** `[was_skipped=true]`

If `was_skipped` parameter is passed, marks an existing completion as rejected

### **DELETE**

Delete completion

---

## `/project/tabs/:tabID/selected-items`

This method manages selected items list – tasks, that you marked as selected. List of selected task is stored on a tab level.

| Parameter   | Type        | Default value | Description
| ----------- | ----------- | ------------- | ------------
| `all`       | `boolean`   | `false`       | Indicates if all tasks should be selected
| `included`  | `number[]`  | `[]`          | List of included IDs when `all=false`
| `excluded`  | `number[]`  | `[]`          | List of excluded IDs when `all=true`

### **POST**

Override selected items list

### **PATCH**

Add items to the list

### **DELETE**

Remove items from the list

---

## `/project/actions`

* **GET**

---

## `/project/tabs/:tabID/actions`

* **POST**
