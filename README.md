# `ren bridge v2`

An easy way to bridge cross-chain assets between blockchains.

![bridge](https://user-images.githubusercontent.com/2221955/108037890-4b8b0100-708e-11eb-948a-289766d0aebd.png)

## Development guide

### `.env`
Ensure you have copied `.env.example` into `.env`, add missing environment variables. Bridge uses Infura internally, ensure you provided your `INFURA_KEY`.

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
