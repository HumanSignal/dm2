## Data Manager 2.0

Data exploration tool for Label Studio.

<img src="/docs/image.png" height="250" align="center"/>

## Summary

<img align="right" height="180" src="https://github.com/heartexlabs/label-studio/blob/master/images/heartex_icon_opossum_green@2x.png?raw=true" />

- [Quick Start](#quick-start)
- [Features](#features-star2)
- [Used APIs](#used-apis)
- [Build and run](#build-and-run)
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

Wait until artifact is built, then navigate to the Label Studio directory and execute the following command in your command line:

```
node scripts/get-build dm [branch-name]
```

## License

This software is licensed under the [Apache 2.0 LICENSE](/LICENSE) © [Heartex](https://www.heartex.ai/). 2020

<img src="https://github.com/heartexlabs/label-studio/blob/master/images/opossum_looking.png?raw=true" title="Hey everyone!" height="140" width="140" />
