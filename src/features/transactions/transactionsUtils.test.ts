import { GatewaySession } from "@renproject/rentx";
import { createTxQueryString, parseTxQueryString } from "./transactionsUtils";

const tx: GatewaySession = {
  customParams: undefined,
  id: "tx-1234abc",
  type: "mint",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  network: "testnet",
  destAddress: "",
  destNetwork: "ethereum",
  targetAmount: 1,
  userAddress: "",
  expiryTime: 1604670899484,
  transactions: {},
};

const txQuery =
  "destAddress=&destNetwork=ethereum&expiryTime=1604670899484&id=tx-1234abc&network=testnet&sourceAsset=btc&sourceNetwork=bitcoin&targetAmount=1&type=mint&userAddress=";

const expectedParsedTx: Partial<GatewaySession> = {
  id: "tx-1234abc",
  type: "mint",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  network: "testnet",
  destAddress: "",
  destNetwork: "ethereum",
  targetAmount: 1,
  userAddress: "",
  expiryTime: 1604670899484,
};

const realTxQuery =
  "destAddress=0xdf88bc963e614fab2bda81c298056ba18e01a424&destNetwork=ethereum&expiryTime=1605142829344&gatewayAddress=2NEJcFe7nkJCHFEu4vP2w1PRfeUb9o2ELhM&id=tx-1425032430964379&network=testnet&nonce=c958acd445371132d990073034a19d2f894ef5a3d0a002a4f75f2d1493de42c3&sourceAsset=btc&sourceNetwork=bitcoin&suggestedAmount=1100000&targetAmount=0.01&type=mint&userAddress=0xdf88bc963e614fab2bda81c298056ba18e01a424";

const realTx = {
  destAddress: "0xdf88bc963e614fab2bda81c298056ba18e01a424",
  destNetwork: "ethereum",
  expiryTime: 1605142829344,
  gatewayAddress: "2NEJcFe7nkJCHFEu4vP2w1PRfeUb9o2ELhM",
  id: "tx-1425032430964379",
  network: "testnet",
  nonce: "c958acd445371132d990073034a19d2f894ef5a3d0a002a4f75f2d1493de42c3",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  suggestedAmount: 1100000,
  targetAmount: 0.01,
  type: "mint",
  userAddress: "0xdf88bc963e614fab2bda81c298056ba18e01a424",
};

test("serializes tx to query", () => {
  const serialized = createTxQueryString(tx);
  expect(serialized).toEqual(txQuery);
});

test("parses tx query to tx", () => {
  const parsed = parseTxQueryString(txQuery);
  expect(parsed).toEqual(expectedParsedTx);
});

test("serializes real tx to query", () => {
  const serialized = createTxQueryString(tx);
  expect(serialized).toEqual(txQuery);
});

test("parses real tx query to tx", () => {
  const parsed = parseTxQueryString(realTxQuery);
  expect(parsed).toEqual(realTx);
});