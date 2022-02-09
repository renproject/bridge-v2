import { FunctionComponent } from "react";
import { Debug } from "../../../../components/utils/Debug";

const useTestProcess = () => {};

export const TestProcess: FunctionComponent = () => {
  const state = useTestProcess();
  return <Debug it={{ state }} />;
};
