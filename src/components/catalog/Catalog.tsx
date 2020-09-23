import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  Link,
  Switch,
  Tab,
  Tabs,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { FunctionComponent, useCallback } from "react";
import { darkTheme, lightTheme } from "../../theme/theme";
import {
  BitcoinIcon,
  GithubIcon,
  MetamaskFoxIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  TxHistoryIcon,
} from "../icons/RenIcons";
import { BridgePaper } from "../layout/BridgePaper";
import { Debug } from "../utils/Debug";
import {
  Cartesian,
  RandomText,
  Section,
  SeparationWrapper,
} from "./PresentationHelpers";

enum TabPhase {
  MINT,
  RELEASE
}

export const Catalog: FunctionComponent = () => {
  const [tab, setTab] = React.useState(TabPhase.MINT);
  const [theme, setTheme] = React.useState("light");
  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue);
  }, []);
  const handleThemeChange = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme]);
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box mb={2}>
          <Typography variant="h1">Catalog</Typography>
          <Divider />
        </Box>
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
        <Section header="Paper">
          <BridgePaper>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
            >
              <Tab label={tab === TabPhase.MINT ? "Minting" : "Mint"} />
              <Tab label={tab === TabPhase.RELEASE ? "Releasing" : "Release"} />
            </Tabs>
            <Typography variant="body1">Application Main Container</Typography>
            <Box height={200} />
            <Button variant="contained" color="primary" size="large" fullWidth>
              Next
            </Button>
          </BridgePaper>
        </Section>
        <Section header="Alerts">
          <Cartesian
            Component={Alert}
            Wrapper={SeparationWrapper}
            propVariants={{
              onClose: [() => {}],
              severity: ["error", "warning", "info", "success"],
            }}
          >
            <span>
              <RandomText /> <Link href="/">a link</Link>
            </span>
          </Cartesian>
        </Section>
        <Section header="Typography">
          <Cartesian
            Component={Typography}
            content={({ variant }) => variant}
            propVariants={{
              variant: [
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "subtitle1",
                "subtitle2",
                "body1",
                "body2",
                "button",
                "caption",
                "overline",
              ],
            }}
          />
        </Section>
        <Section header="Tooltips">
          <Typography variant="body1">
            This is a text with a{" "}
            <Tooltip title="And appears here">
              <Typography color="primary" display="inline">
                tooltip
              </Typography>
            </Tooltip>{" "}
            ,it can be initially{" "}
            <Tooltip
              title={
                <span>
                  <RandomText />
                  with{" "}
                  <Link color="inherit" href="/">
                    link
                  </Link>
                </span>
              }
              open
            >
              <Typography color="secondary" display="inline">
                opened
              </Typography>
            </Tooltip>{" "}
            on hover. <br />
            <Tooltip placement="bottom-start" title="like that">
              <Typography color="primary" display="inline">
                Bottom placement
              </Typography>
            </Tooltip>{" "}
            is also possible.
          </Typography>
        </Section>
        <Section header="Icons">
          <SeparationWrapper>
            <TxHistoryIcon />
            <BitcoinIcon />
            <GithubIcon />
            <MetamaskFoxIcon />
            <RedditIcon />
            <TelegramIcon />
            <TwitterIcon />
          </SeparationWrapper>
        </Section>
        <FormControlLabel
          control={
            <Switch
              checked={theme === "dark"}
              onChange={handleThemeChange}
              name="theme"
              color="primary"
            />
          }
          label="Dark mode (very beta)"
        />
        <Section header="Theme configuration">
          <Debug force it={selectedTheme} />
        </Section>
      </Container>
    </ThemeProvider>
  );
};
