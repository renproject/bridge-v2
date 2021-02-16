import { TxType } from "../transactions/transactionsUtils";
import { SimpleFee, getTransactionFees } from "./feesUtils";

const mockedFees: SimpleFee = {
  mint: 20,
  burn: 10,
  lock: 100000,
  release: 100000,
};

test("no fees", () => {
  const calculated = getTransactionFees({
    amount: 1,
    type: TxType.MINT,
    fees: null,
  });
  const expected = {
    conversionTotal: 1,
    networkFee: 0,
    renVMFee: 0,
    renVMFeeAmount: 0,
  };
  expect(calculated).toEqual(expected);
});

describe("burn", () => {
  const type = TxType.BURN;
  test("1", () => {
    const calculated = getTransactionFees({
      amount: 1,
      type,
      fees: mockedFees,
    });
    const expected = {
      conversionTotal: 0.998,
      networkFee: 0.001,
      renVMFee: 0.001,
      renVMFeeAmount: 0.001,
    };
    expect(calculated).toEqual(expected);
  });

  test("1000", () => {
    const calculated = getTransactionFees({
      amount: 1000,
      type,
      fees: mockedFees,
    });
    expect(calculated.renVMFeeAmount).toEqual(1); // 0.001 * amount
    expect(calculated.conversionTotal).toEqual(998.999); /// -1 - 0.001
  });

  test("1.234", () => {
    const calculated = getTransactionFees({
      amount: 1.234,
      type,
      fees: mockedFees,
    });
    expect(calculated.renVMFeeAmount).toEqual(0.001234);
    expect(calculated.conversionTotal).toEqual(1.231766);
  });
});

describe("mint", () => {
  const type = TxType.MINT;
  test("1", () => {
    const calculated = getTransactionFees({
      amount: 1,
      type,
      fees: mockedFees,
    });
    const expected = {
      conversionTotal: 0.997,
      networkFee: 0.001,
      renVMFee: 0.002,
      renVMFeeAmount: 0.002,
    };
    expect(calculated).toEqual(expected);
  });

  test("1000", () => {
    const calculated = getTransactionFees({
      amount: 1000,
      type,
      fees: mockedFees,
    });
    expect(calculated.renVMFeeAmount).toEqual(2); // 0.002 * amount
    expect(calculated.conversionTotal).toEqual(997.999); /// -2 - 0.001
  });
});
