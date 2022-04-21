const WELCOME = "/welcome";
const CATALOG = "/catalog";
const ABOUT = "/about";
const HOME = "/";
const MINT = "/mint";
const RELEASE = "/release";
const BRIDGE = "/bridge";

const __GATEWAY = "/gateway";
const __GATEWAY_H2H = "/gateway-h2h";

const TEST = "test";

const MINT__GATEWAY_STANDARD = MINT + __GATEWAY;
const MINT__GATEWAY_H2H = MINT + __GATEWAY_H2H;
const RELEASE__GATEWAY_STANDARD = RELEASE + __GATEWAY;
const RELEASE__GATEWAY_H2H = RELEASE + __GATEWAY_H2H;
const BRIDGE_GATEWAY = BRIDGE + __GATEWAY;

export const paths = {
  WELCOME,
  CATALOG,
  ABOUT,
  HOME,
  MINT,
  MINT__GATEWAY_STANDARD,
  MINT__GATEWAY_H2H,
  RELEASE,
  RELEASE__GATEWAY_STANDARD,
  RELEASE__GATEWAY_H2H,
  BRIDGE,
  BRIDGE_GATEWAY,
  TEST,
};
