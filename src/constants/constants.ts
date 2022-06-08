export const appName = "RenBridge V3";

export enum storageKeys {
  TERMS_AGREED = "termsAgreed",
  SAFETY_ACK = "safetyAck",
}

export const links = {
  DOCS: "https://docs.renproject.io/developers/",
  WIKI: "https://github.com/renproject/ren/wiki",
  FAQ: "https://docs.renproject.io/darknodes/faq/renbridge-faq",
  SECURITY_AUDITS: "https://github.com/renproject/ren/wiki/Audits",
  BUGS_LOG: "https://renprotocol.typeform.com/to/YdmFyB",
  REN_EXPLORER_GUIDE:
    "https://renproject.notion.site/Using-RenVM-s-Explorer-to-Solve-RenBridge-Issues-b190709927934b1f8dbd62e6df42f3ed",
  SOCIAL_TWITTER: "https://twitter.com/renprotocol",
  SOCIAL_GITHUB: "https://github.com/renproject",
  SOCIAL_TELEGRAM: "https://t.me/renproject",
  SOCIAL_REDDIT: "https://www.reddit.com/r/renproject",
  LEDGER_BLIND_SIGNING:
    "https://support.ledger.com/hc/en-us/articles/360016265659-Solana-SOL-?docs=true",
};

export const prodDomains = [
  "bridge-staging.renproject.io",
  "staging.bridge.renproject.io",
  "bridge.renproject.io",
];

export const MINT_GAS_UNIT_COST = 153400;
export const RELEASE_GAS_UNIT_COST = MINT_GAS_UNIT_COST;
