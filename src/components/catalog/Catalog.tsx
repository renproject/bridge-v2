import { Button, Typography } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import { theme } from '../../theme/theme'
import { BridgePaper } from '../layout/BridgePaper'
import { Debug } from '../utils/Debug'
import { Cartesian, Wrapper } from './PresentationHelpers'

export const Catalog: FunctionComponent = () => {
  return (
    <div>
      <Typography variant="h1">Component Catalog</Typography>
      <Typography variant="h2">Buttons</Typography>
      <Wrapper>
        <Button variant="contained" color="primary" size="large">
          Primary Button
        </Button>
        <Button variant="contained" color="secondary" size="large">
          Secondary Button
        </Button>
      </Wrapper>
      <Cartesian
        Component={Button}
        Wrapper={Wrapper}
        content={(props: any) => `${props.color}`}
        propVariants={{
          variant: ["contained"],
          size: ["large"],
          color: ["primary", "secondary"],
          disabled: [true, false],
        }}
      />
      <BridgePaper>
        <Typography variant="body1">Body</Typography>
      </BridgePaper>
      <Typography variant="h4">Theme configuration:</Typography>
      <Debug force it={theme} />
    </div>
  );
};
