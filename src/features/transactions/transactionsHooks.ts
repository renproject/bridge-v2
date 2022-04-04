import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentTxHash } from "./transactionsSlice";

export const useSetCurrentTxHash = (hash = "") => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCurrentTxHash(hash));
    return () => {
      dispatch(setCurrentTxHash(""));
    };
  }, [dispatch, hash]);
};
