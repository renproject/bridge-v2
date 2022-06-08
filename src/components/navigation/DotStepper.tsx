import { Button, MobileStepper, MobileStepperProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import React, { FunctionComponent } from "react";

const useDotStepperStyles = makeStyles((theme) => ({
  button: {
    textTransform: "uppercase",
    alignItems: "flex-end",
    fontWeight: 700,
  },
}));

type DotStepperProps = Omit<MobileStepperProps, "backButton" | "nextButton"> & {
  handleNext: () => void;
  handleBack: () => void;
};
export const DotStepper: FunctionComponent<DotStepperProps> = ({
  handleNext,
  handleBack,
  activeStep,
  steps,
  ...rest
}) => {
  const styles = useDotStepperStyles();
  return (
    <MobileStepper
      variant="dots"
      position="static"
      steps={steps}
      activeStep={activeStep}
      nextButton={
        <Button
          size="small"
          className={styles.button}
          onClick={handleNext}
          disabled={activeStep === steps - 1}
        >
          <span>Next</span>
          <KeyboardArrowRight />
        </Button>
      }
      backButton={
        <Button
          variant="text"
          size="small"
          className={styles.button}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          <KeyboardArrowLeft />
          <span>Back</span>
        </Button>
      }
      {...rest}
    />
  );
};
