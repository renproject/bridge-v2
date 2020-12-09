import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPaperShaking } from "./uiSlice";

export const useShakePaper = (shake: boolean, timeout = 600) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (shake) {
      dispatch(setPaperShaking(true));
      setTimeout(() => {
        dispatch(setPaperShaking(false));
      }, timeout);
    }
    return () => {
      dispatch(setPaperShaking(false));
    };
  }, [dispatch, shake, timeout]);
};
