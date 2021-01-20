# API Reference

DataManager uses LabelStudio API to operate.

Request parameters shoud be JSON.

Responses are in JSON as well.

### `/project`

##### **GET**

Information about current project

<details>
<summary><b style="font-size: 16px">JSON response example</b></summary>
<p>

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

</details>
---



### `/project/columns`

##### **GET**

Information about columns of the dataset.

#### Response

| Parameter | Type | Description |
| -----------                           | ----------- | ------------ |
| columns                             | List<[Column](#Column)> | List of columns |

<details>
<summary><b style="font-size: 16px">JSON response example</b></summary>
<p>

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

</p>
</details>

---

#### `/project/tabs`

##### **GET**

Information about tabs in current project

| Property | Type              | Description  |
| -------- | ----------------- | ------------ |
| tabs     | List<[Tab](#Tab)> | List of tabs |

<details>
<summary><b style="font-size: 16px">JSON response example</b></summary>
<p>

```json
{
  "tabs": [
    {
      "columnsDisplayType": {
        "tasks:data.image": "Image"
      },
      "columnsWidth": {
        "tasks:total_predictions": 117
      },
      "filters": {
        "conjunction": "and",
        "items": []
      },
      "gridWidth": 4,
      "hiddenColumns": {
        "explore": [
          "tasks:completions_results",
          "tasks:predictions_score",
          "tasks:predictions_results"
        ],
        "labeling": [
          "tasks:total_completions",
          "tasks:cancelled_completions",
          "tasks:total_predictions",
          "tasks:completions_results",
          "tasks:predictions_score",
          "tasks:predictions_results"
        ]
      },
      "id": 1,
      "ordering": [
        "-tasks:id"
      ],
      "selectedItems": {
        "all": false,
        "included": []
      },
      "target": "tasks",
      "title": "Tab 1",
      "type": "list"
    }
  ]
}
```

</p>
</details>

---

### `/project/tabs/:tabID`

##### **POST**

Create tab or update existing one

##### **DELETE**

Delete specific tab

---

### `/project/tabs/:tabID/tasks`

##### **GET**

Pages set of samples in the dataset

---

### `/tasks/:taskID`

##### **GET**

Returns a specific task

---

### `/project/next`

##### **GET**

According to sampling settings returns next task in the dataset

---

### `/project/tabs/:tabID/annotations`

##### **GET**

Annotations for the current dataset

---

### `/tasks/:taskID/completions`

##### **GET**

Completions for the current dataset

##### **POST** `[was_skipped=true]`

If `was_skipped` parameter is passed, creates a completion marked as rejected

---

### `/tasks/:taskID/completions/:id`

##### **GET**

Get a completion for a specific task

##### **POST** `[was_skipped=true]`

If `was_skipped` parameter is passed, marks an existing completion as rejected

##### **DELETE**

Delete completion

---

### `/project/tabs/:tabID/selected-items`

This method manages selected items list – tasks, that you marked as selected. List of selected task is stored on a tab level.

| Parameter  | Type      | Default value                             |
| ---------- | --------- | ----------------------------------------- |
| `all`      | `boolean` | Indicates if all tasks should be selected |
| `included` | `int[]`   | List of included IDs when `all=false`     |
| `excluded` | `int[]`   | List of excluded IDs when `all=true`      |

##### **POST**

Override selected items list

##### **PATCH**

Add items to the list

##### **DELETE**

Remove items from the list

---

### `/project/actions`

* **GET**

---

### `/project/tabs/:tabID/actions`

* **POST**



## Type Reference

### Tab

Tab represents a materialized view that can slice and order the data

| Property             | Type                                                         | Description                                    |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `id`                 | int                                                          | Tab identifier                                 |
| `type`               | "list" \| "grid"                                             | Display type                                   |
| `title`              | string                                                       | Human readable title                           |
| `target`             | "tasks" \| "annotations"                                     | Currently shown entity type                    |
| `filters`            | [Filter](#Filter)                                            | Filter applied to the tab                      |
| `ordering`           | List<ColumnAlias\|-ColumnAlias>                              | Ordering applied to the tab                    |
| `selectedItems`      | SelectedItems                                                | List of checked samples                        |
| `columnsDisplayType` | Dict<[ColumnAlias](#ColumnALias), [ColumnType](#ColumnType)> | List of display types override for data values |
| `columnsWidth`       | Dict<[ColumnAlias](#ColumnAlias), int>                       | Width of each individual column                |
| `hiddenColumns`      | Dict<"explore" \| "labeling", List<[ColumnAlias](#ColumnAlias)>> | List of hidden tabs per view                   |

### Column

`Column` represents a single field of the dataset samle:

| Property | Type | Description |
| -------- | ---- | ----------- |
| column.id                           | string    | Column identifier |
| column.parent                       | string \| null | Parent identifier |
| column.target                     | "tasks" \| "annotations" | Entity the column is attached to |
| column.title                      | string    | Human readable title |
| column.type                         | [ColumnType](#ColumnType) | Column value type |
| column.children                     | List<String> \| null | Column identifier |
| column.visibility_defaults          | Dict<"explore"\|"labeling", Boolean> | Column identifier |

### ColumnType

Represents a type of a column value. Column can have one of the tipes listed below.

| Type          | Description |
| ---           | - |
| String      | Primitive string |
| Boolean     | Primitive boolean |
| Number      | `Int` or `Double` |
| Datetime    | Date and time in ISO format |
| List<T>     | List of items. T can be one of the types listed in this table |
| Image       | Image url |
| Audio       | Audio url |
| AudioPlus   | Audio url |
| Text        | Text string |
| HyperText   | HTML or XML based markup |
| TimeSeries  | TimeSeries data |
| Unknown     | Type cannot be determined by the backend |

### ColumnAlias

`ColumnAlias` is an aggregated field that combines full path to the column. ColumnAlias is built using the following rules:

- `[target]:[column_name]`
- `[target]:[full_path].[column_name]`

Full path is a path that combines all parent columns. E.g. you have a `data` column that contains several values:

```json
{
  "data": {
    "image": "https://example.com/image.jpg"
  }
}
```

In this case columns will look like this:

```json
{
  "columns": [
    {
      "id": "data",
      "title": "Data",
      "children": ["image"],
      "target": "tasks",
    },
    {
      "id": "image",
      "title": "image",
      "parent": "data",
      "target": "tasks",
    }
  ]
}
```

As the columns list is flat, full path will reference all ascending columns: `tasks:data.image`

In some cases `ColumnAlias` might be negative. For example negative values are used for ordering: `-tasks:data.image`

### SelectedItems

Selected items is an object that stores samples checked in the UI. To operate effectively on large amounts of data it uses partial selection approach. The structure of this object is the following:

```json
// In this case we select only items with IDs 1, 2 and 3
{
  "selectedItems": {
    "all": false,
    "included": [1, 2, 3]
  }
}

// SelectedItems can select all the items in the dataset regardless of the size
{
  "selectedItems": {
    "all": true,
  }
}

// With `excluded` list you can select all but `excluded`
// In this example we select all items except 1, 2 and 3
{
  "selectedItems": {
    "all": true,
    "excluded": [1, 2, 3]
  }
}
```

### Filter

Filter brings granularity to the data
