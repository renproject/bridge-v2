import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFees } from "./feesSlice";
import { fetchFees } from "./feesUtils";

export const useFetchFees = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    fetchFees().then((fees) => {
      console.log(fees);
      dispatch(setFees(fees));
    });
  }, [dispatch]);
};
