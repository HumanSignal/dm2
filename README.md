## Data Manager 2.0 &middot; ![Build and Test](https://github.com/heartexlabs/dm2/workflows/Build%20and%20Test/badge.svg)

[Website](https://labelstud.io/) • [Docs](https://labelstud.io/guide) • [Twitter](https://twitter.com/heartexlabs) • [Join Slack Community <img src="https://go.heartex.net/docs/images/slack-mini.png" width="18px"/>](https://docs.google.com/forms/d/e/1FAIpQLSdLHZx5EeT1J350JPwnY2xLanfmvplJi6VZk65C2R4XSsRBHg/viewform?usp=sf_link)

Data exploration tool for [Label Studio][ls].

<img src="/docs/image.png" height="500" align="center"/>

## Summary

<img align="right" height="180" src="https://github.com/heartexlabs/label-studio/blob/master/images/heartex_icon_opossum_green@2x.png?raw=true" />

- [Quick Start](#quick-start)
- [Features](#features-star2)
- [Used APIs](#used-apis)
- [Build and run](#build-and-run)
- [Develoment](#development)
- [License](#license)

### Quickstart

```
npm install @heartex/datamanager
```

### Features

- Grid and list view to easily explore your datasets
- Customizable data representation: select what data you want to see and how to show it
- Easily slice your datasates with filters for more precise exploration
- Deep integration with Label Studio Frontend

### Used APIs

Check available APIs [here](/src/sdk/api-config.js)

### Build and run

#### Run in development mode with server API

Ensure that Label Studio is running, then execute a command in the command line:

```
REACT_APP_USE_LSB=true REACT_APP_GATEWAY_API=http://localhost:8080/api npm run start
```

#### Build for production and standalone usage

Builds a CommonJS compatible module

```
npm run build:module
```

#### Build for Label Studio

Wait until the artifact is built, then navigate to the Label Studio directory and execute the following command in your command line:

```
node scripts/get-build.js dm [branch-name]
```

`branch-name` – optional, default: `master`

## Development

### Prerequesties

For the development it is required to have Label Studio install and running as the DataManager uses LabelStudio API to operate.

If you're using your own backend, make sure that the API implements all the methods DataManager requires.

### Running local version of DataManager

```
npm ci
```

Run local version of the DataManager

```
npm start
```

### DataManager and Label Studio Frontend

By default DataManager comes with the latest version of Label Studio Frontent available on npm at the moment.

If you need another version, you have several options to connect it.

#### Using version from unpkg.com

You can take whatever version of LSF you need from unpkg.com and replace the existing one in `public/index.html`.

#### Using local clone

If need more control over the changes or you're developing some sort of integration between DataManager and Label Studio Frontend, you'll need to clone `label-studio-frontend` locally first.

1. Follow the [Development guide](https://github.com/heartexlabs/label-studio-frontend#development) first and build a production version of Label Studio Frontend.
2. Grab the contents of `./build/static` directory and copy it over to Data Manager `public` folder.
3. Edit `public/index.html`, you will need to replace these two lines:

```diff
<!-- Label Studio Frontend -->
-    <link href="https://unpkg.com/label-studio@latest/build/static/css/main.css" rel="stylesheet">
-    <script src="https://unpkg.com/label-studio@latest/build/static/js/main.js"></script>
+    <link href="./static/css/main.css" rel="stylesheet">
+    <script src="./static/js/main.js"></script>
```

## Ecosystem

| Project | Description |
|-|-|
| [label-studio][ls] | Server part, distributed as a pip package |
| [label-studio-frontend][lsf] | Frontend part, written in JavaScript and React, can be embedded into your application |
| [label-studio-converter][lsf] | Encode labels into the format of your favorite machine learning library |
| [label-studio-transformers][lst] | Transformers library connected and configured for use with label studio |
| datamanager | Data exploration tool for Label Studio |

## License

This software is licensed under the [Apache 2.0 LICENSE](/LICENSE) © [Heartex](https://www.heartex.ai/). 2020

<img src="https://github.com/heartexlabs/label-studio/blob/master/images/opossum_looking.png?raw=true" title="Hey everyone!" height="140" width="140" />

[ls]: https://github.com/heartexlabs/label-studio
[lsf]: https://github.com/heartexlabs/label-studio-frontend
[lsc]: https://github.com/heartexlabs/label-studio-converter
[lst]: https://github.com/heartexlabs/label-studio-transformers
