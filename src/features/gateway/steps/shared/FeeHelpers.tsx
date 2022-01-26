import { Slide } from "@material-ui/core";
import { FunctionComponent, ReactNode, useCallback, useState } from "react";
import { SecondaryActionButton } from "../../../../components/buttons/Buttons";

export const FeesToggler: FunctionComponent = ({ children }) => {
  const [shown, setShown] = useState(false);
  const toggleShow = useCallback(() => {
    setShown((shown) => !shown);
  }, []);
  return (
    <div>
      <SecondaryActionButton onClick={toggleShow}>Show</SecondaryActionButton>
      <Slide in={shown}>
        <div>{children}</div>
      </Slide>
    </div>
  );
};
