import { GatewaySession } from "@renproject/rentx";
import { createTxQueryString, parseTxQueryString } from "./transactionsUtils";

const exampleTx: GatewaySession = {
  id: "tx-1234abc",
  type: "mint",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  network: "testnet",
  destAddress: "",
  destNetwork: "ethereum",
  destAsset: "renBTC",
  targetAmount: 1,
  destConfsTarget: 6,
  userAddress: "",
  expiryTime: 1604670899484,
  transactions: {},
};

const serializedExampleTxQs =
  "tx=%7B%22id%22%3A%22tx-1234abc%22%2C%22type%22%3A%22mint%22%2C%22sourceAsset%22%3A%22btc%22%2C%22sourceNetwork%22%3A%22bitcoin%22%2C%22network%22%3A%22testnet%22%2C%22destAddress%22%3A%22%22%2C%22destNetwork%22%3A%22ethereum%22%2C%22destAsset%22%3A%22renBTC%22%2C%22targetAmount%22%3A1%2C%22destConfsTarget%22%3A6%2C%22userAddress%22%3A%22%22%2C%22expiryTime%22%3A1604670899484%2C%22transactions%22%3A%7B%7D%7D";

test("converts tx to query string", () => {
  const serialized = createTxQueryString(exampleTx);
  expect(serialized).toEqual(serializedExampleTxQs);
});

test("converts tx query string to tx", () => {
  const parsed = parseTxQueryString(serializedExampleTxQs);
  expect(parsed).toEqual(exampleTx);
});
