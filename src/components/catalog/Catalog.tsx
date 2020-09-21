import { Box, Button, Tab, Tabs, Typography, } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { FunctionComponent, useCallback } from 'react'
import { LoremIpsum } from 'react-lorem-ipsum'
import { theme } from '../../theme/theme'
import { BridgePaper } from '../layout/BridgePaper'
import { Debug } from '../utils/Debug'
import { Cartesian, Wrapper } from './PresentationHelpers'

export const Catalog: FunctionComponent = () => {
  const [tab, setTab] = React.useState(0);

  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue);
  }, []);

  return (
    <div>
      <Typography variant="h5">Component Catalog</Typography>
      <Typography variant="h6">Buttons</Typography>
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
      <Typography variant="h6">Paper</Typography>
      <BridgePaper>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Mint" />
          <Tab label="Release" />
        </Tabs>
        <Typography variant="body1">Application Main Container</Typography>
        <Box height={200} />
        <Button variant="contained" color="primary" size="large" fullWidth>
          Next
        </Button>
      </BridgePaper>
      <Typography variant="h4">Alerts</Typography>
      <Cartesian
        Component={Alert}
        Wrapper={Wrapper}
        propVariants={{
          onClose: [() => {}],
          severity: ["error", "warning", "info", "success"],
        }}
      >
        <span>
          <LoremIpsum p={1} avgSentencesPerParagraph={4} />
          <a href="/">a link</a>
        </span>
      </Cartesian>
      <Typography variant="h4">Theme configuration:</Typography>
      <Debug force it={theme} />
    </div>
  );
};
