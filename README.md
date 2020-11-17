## Data Manager 2.0

```bash
npm run start
```

## Used APIs

### Base

`/project/columns` – columns list for both tasks and annotations
`/project/tabs` – tabs with filters and hidden columns
`/project/tabs/:tabID/tasks` – tasks
`/project/tabs/:tabID/annotations` – annotations
`/project/tabs/:tabID/tasks/:taskID/annotations` – annotations for a particular task

### Completions

`/completions`

### Run in development mode with server API

REACT_APP_USE_LSB=true REACT_APP_GATEWAY_API=http://localhost:8080/api npm run start