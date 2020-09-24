import { Button } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { SettingsButton } from "../../buttons/Buttons";
import { Cartesian, Section, SeparationWrapper } from "../PresentationHelpers";

export const ButtonsSection: FunctionComponent = () => {
  return (
    <>
      <Section header="Buttons">
        <SeparationWrapper>
          <Button variant="contained" color="primary" size="large">
            Primary Button
          </Button>
          <Button variant="contained" color="secondary" size="large">
            Secondary Button
          </Button>
        </SeparationWrapper>
        <Cartesian
          Component={Button}
          Wrapper={SeparationWrapper}
          content={(props: any) => `${props.color}`}
          propVariants={{
            variant: ["contained"],
            size: ["large", "small"],
            color: ["primary", "secondary"],
            disabled: [true, false],
          }}
        />
      </Section>
      <Section header="Special Buttons">
        <SeparationWrapper>
          <SettingsButton />
        </SeparationWrapper>
      </Section>
    </>
  );
};
