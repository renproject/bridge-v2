# `ren bridge v2`

An easy way to bridge cross-chain assets between blockchains.

![bridge](https://user-images.githubusercontent.com/2221955/108037890-4b8b0100-708e-11eb-948a-289766d0aebd.png)

## Development guide

### `.env`
Ensure you have copied `.env.example` into `.env`, add missing environment variables. Bridge uses Infura internally, create and provide your `INFURA_KEY`.

### `yarn`

Ensure the dependencies are installed by running `yarn`.

Available commands:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.<br />

## Architecture
The app was build on top of [CRA](https://reactjs.org/docs/create-a-new-react-app.html), [Material-UI](https://material-ui.com/) with [redux-toolkit](https://redux-toolkit.js.org/) for shared state management.

The core RenVM libraries on which the application is built are as follows:

[`@renproject/multiwallet-ui`](https://www.npmjs.com/package/@renproject/multiwallet-ui) - provides extensible wallet selection, connection and management features for React apps. It comes together with default UI, but can be adapted to any React UI framework.

[`@renproject/rentx`](https://www.npmjs.com/package/@renproject/rentx) - RenTX creates transactions traces its progress. Allows transactions state tracing and makes it easier to build UI for appropriate transaction stages.

[`@renproject/ren`](https://www.npmjs.com/package/@renproject/ren) - RenJS is the core library for interacting with RenVM. RenTX uses it internally. Bridge uses it for things such as fees calculation.
