import { BurnSession, GatewaySession } from "@renproject/ren-tx";
import { BridgeChain } from "../../utils/assetConfigs";
import {
  createTxQueryString,
  getMintTxPageTitle,
  getPaymentLink,
  getReleaseTxPageTitle,
  parseTxQueryString,
} from "./transactionsUtils";

const mintTx: GatewaySession<any> = {
  customParams: {},
  id: "tx-1234abc",
  sourceAsset: "btc",
  sourceChain: "bitcoin",
  network: "testnet",
  destAddress: "",
  destChain: "ethereum",
  userAddress: "",
  expiryTime: 1604670899484,
  createdAt: 1622445762598,
  transactions: {},
};

const releaseTx: BurnSession<any, any> = {
  customParams: {},
  id: "tx-1234abcd",
  createdAt: 1622445762598,
  sourceAsset: "btc",
  sourceChain: "ethereum",
  network: "testnet",
  destAddress: "",
  destChain: "bitcoin",
  userAddress: "",
  targetAmount: "1",
};

describe("(de/se)rialization", () => {
  const txQuery =
    "createdAt=1622445762598&customParams=%7B%7D&destAddress=&destChain=ethereum&expiryTime=1604670899484&id=tx-1234abc&network=testnet&sourceAsset=btc&sourceChain=bitcoin&transactions=%7B%7D&userAddress=";

  const expectedParsedTx: Partial<GatewaySession<any>> = {
    customParams: {},
    id: "tx-1234abc",
    sourceAsset: "btc",
    sourceChain: "bitcoin",
    network: "testnet",
    destAddress: "",
    destChain: "ethereum",
    transaction: {},
    transactions: {},
    createdAt: 1622445762598,
    userAddress: "",
    expiryTime: 1604670899484,
  };

  const realTxQuery =
    "createdAt=1622445762598&customParams=%7B%7D&destAddress=0xdf88bc963e614fab2bda81c298056ba18e01a424&destChain=ethereum&expiryTime=1605142829344&gatewayAddress=2NEJcFe7nkJCHFEu4vP2w1PRfeUb9o2ELhM&id=tx-1425032430964379&network=testnet&nonce=c958acd445371132d990073034a19d2f894ef5a3d0a002a4f75f2d1493de42c3&sourceAsset=btc&sourceChain=bitcoin&suggestedAmount=1100000&targetAmount=0.01&&userAddress=0xdf88bc963e614fab2bda81c298056ba18e01a424";

  const realTx = {
    customParams: {},
    destAddress: "0xdf88bc963e614fab2bda81c298056ba18e01a424",
    destChain: "ethereum",
    expiryTime: 1605142829344,
    gatewayAddress: "2NEJcFe7nkJCHFEu4vP2w1PRfeUb9o2ELhM",
    id: "tx-1425032430964379",
    network: "testnet",
    nonce: "c958acd445371132d990073034a19d2f894ef5a3d0a002a4f75f2d1493de42c3",
    sourceAsset: "btc",
    sourceChain: "bitcoin",
    suggestedAmount: 1100000,
    targetAmount: 0.01,
    createdAt: 1622445762598,
    transactions: {},
    transaction: {},
    userAddress: "0xdf88bc963e614fab2bda81c298056ba18e01a424",
  };

  test("serializes tx to query", () => {
    const serialized = createTxQueryString(mintTx);
    expect(serialized).toEqual(txQuery);
  });

  test("parses tx query to tx", () => {
    const parsed = parseTxQueryString(txQuery);
    expect(parsed).toEqual(expectedParsedTx);
  });

  test("serializes real tx to query", () => {
    const serialized = createTxQueryString(mintTx);
    expect(serialized).toEqual(txQuery);
  });

  test("parses real tx query to tx", () => {
    const parsed = parseTxQueryString(realTxQuery);
    expect(parsed).toEqual(realTx);
  });
});

describe("pageTitle", () => {
  test("constructs mint tx page title", () => {
    const title = getMintTxPageTitle(mintTx);
    expect(title).toEqual("Mint - BTC - 2021-05-31T07:22:42.598Z");
  });

  test("constructs release tx page title", () => {
    const title = getReleaseTxPageTitle(releaseTx);
    expect(title).toEqual("Release - 1 BTC");
  });
});

describe("paymentLinks", () => {
  test("generates payment link", () => {
    const result = getPaymentLink(BridgeChain.BTCC, "12345abcde");
    expect(result).toEqual("bitcoin://12345abcde");
  });

  test("generates payment link for zcash", () => {
    const result = getPaymentLink(BridgeChain.ZECC, "12345abcde");
    expect(result).toEqual("zcash:12345abcde");
  });
});
