# `ren bridge v2`

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

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.<br />

## Architecture

The app was build on top of [CRA](https://reactjs.org/docs/create-a-new-react-app.html), [Material-UI](https://material-ui.com/) with [redux-toolkit](https://redux-toolkit.js.org/) for shared state management.

The core RenVM libraries on which the application is built are as follows:

[`@renproject/multiwallet-ui`](https://www.npmjs.com/package/@renproject/multiwallet-ui) - provides extensible wallet selection, connection and management features for React apps. It comes together with default UI, but can be adapted to any React UI framework.

[`@renproject/rentx`](https://www.npmjs.com/package/@renproject/rentx) - RenTX is for managing transactions. Allows transactions state tracing and makes it easier to build UI for appropriate transaction stages.

[`@renproject/ren`](https://www.npmjs.com/package/@renproject/ren) - RenJS is the core library for interacting with RenVM. RenTX uses it internally. Bridge uses it for things such as fees calculation.

## Forking

You are free to fork this app and adapt/extend it to your needs.

```sh
git clone https://github.com/renproject/bridge-v2.git
```

### Requirements

RenBridge requires an Infura key provided as an environment variable. You can create one by going to [infura.io](https://infura.io). If another Ethereum provider is being used, it can be changed in [Multiwallet.tsx](src/providers/multiwallet/Multiwallet.tsx).

### Common cases

Here are some common cases you can run into:

#### Adding new asset

If you want to add a new asset, follow these steps:

- add asset source chain and appropriate mappings to [rentx.ts](src/services/rentx.ts)
- add a new asset and its chain data in [assetConfigs.ts](src/utils/assetConfigs.ts). Ensure you covered following points:
  - add a new asset symbol to `BridgeCurrency` enum
  - add the newly installed chain to `RenChain` and `BridgeChain` enums
  - add a new `BridgeCurrencyConfig` entry in `currenciesConfig`.
    Should include labels, icons/coloring, source chain and network mappings.
  - add a new `BridgeChainConfig` entry in `chainsConfig`.
    Should include labels, icons, block time/confirmations data and native currency mapping
  - extend `toMintedCurrency` and `toReleasedCurrency` functions with new asset mappings
  - enable newly added asset in `supportedLockCurrencies`, `supportedReleaseCurrencies`

#### Changing visual appearance
It requires `CROWDIN_PERSONAL_TOKEN` in your .env
Most of the visual - related configuration lies in a [theme](src/theme) folder. To find out how to style Material UI, check [this link](https://material-ui.com/customization/theming/). Icons, logos and other images can be found in [assets](src/assets) folder.

#### Updating translations
It requires installing `crowdin`. You can do that with `npm i -g @crowdin/cli
`


Once added to `en.json`, upload translation with
`crowdin upload`. After community translations ready, do `crowdin download`. It will automatically download and substitute translations in [locales](src/i18n/locales) folder.

### Deploying

Any static hosting site can be used, such as GitHub pages, Netlify or Cloudflare pages, or on IPFS through a service like [Fleek](https://blog.fleek.co/posts/fleek-create-react-app).

For GitHub pages, instructions can be found here: https://create-react-app.dev/docs/deployment#github-pages.
