# `ren bridge v3`

An easy way to bridge cross-chain assets between blockchains.

![bridge](https://user-images.githubusercontent.com/2221955/108037890-4b8b0100-708e-11eb-948a-289766d0aebd.png)

## Development guide

### `.env`

Copy `.env.example` into `.env` and add missing environment variables. Bridge uses Infura internally, so you'll need to go to [infura.io](https://infura.io), create a key and set `REACT_APP_INFURA_ID` in the `.env` file.

### `yarn`

Ensure the dependencies are installed by running `yarn`.

Available commands:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn start-functions`

Runs netlify functions in the development mode.<br />
Open [http://localhost:9999](http://localhost:9999) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.<br />

## Updating translations

To update the translations, you need to:

1. Add a `CROWDIN_PERSONAL_TOKEN`, `CROWDIN_PROJECT_ID` in your `.env`.
2. Install the `crowdin` CLI. You can do that with `npm i -g @crowdin/cli`.

You can then update `en.json` and upload the changes to Crowdin with `crowdin upload`. After community translations are ready, run `crowdin download` to download and substitute translations in the [locales](src/i18n/locales) folder.

Alternatively you can use [i18next-parser](https://github.com/i18next/i18next-parser) to scan files for newly added keys and update `en.json` file. If installed, run

`yarn run scan`


## Architecture

The app was build on top of [CRA](https://reactjs.org/docs/create-a-new-react-app.html), [Material-UI](https://material-ui.com/) with [redux-toolkit](https://redux-toolkit.js.org/) for shared state management.

The core RenVM libraries on which the application is built are as follows:

[`@renproject/multiwallet-ui`](https://www.npmjs.com/package/@renproject/multiwallet-ui) - provides extensible wallet selection, connection and management features for React apps. It comes together with default UI, but can be adapted to any React UI framework.

[`@renproject/ren`](https://www.npmjs.com/package/@renproject/ren) - RenJS is the core library for interacting with RenVM.

## Forking

You are free to fork this app and adapt/extend it to your needs.

```sh
git clone https://github.com/renproject/bridge-v2.git
```

### Requirements

RenBridge requires an Infura key provided as an environment variable. You can create one by going to [infura.io](https://infura.io). If another Ethereum provider is being used, it can be changed in [Multiwallet.tsx](src/providers/multiwallet/Multiwallet.tsx).

#### Changing visual appearance

Most of the visual - related configuration lies in a [theme](src/theme) folder. To find out how to style Material UI, check [this link](https://material-ui.com/customization/theming/). Icons, logos and other images can be found in [assets](src/assets) folder.

### Deploying

Any static hosting site can be used, such as GitHub pages, Netlify or Cloudflare pages, or on IPFS through a service like [Fleek](https://blog.fleek.co/posts/fleek-create-react-app).

For GitHub pages, instructions can be found here: https://create-react-app.dev/docs/deployment#github-pages.
