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
import React, { FunctionComponent, useCallback } from "react";
import { darkTheme, lightTheme } from "../../theme/theme";
import { AssetDropdown } from "../dropdowns/AssetDropdown";
import { BridgePaper } from "../layout/Paper";
import { Debug } from "../utils/Debug";
import { Cartesian, RandomText, Section } from "./PresentationHelpers";
import { ButtonsSection } from "./sections/ButtonsSection";
import { IconsSection } from "./sections/IconsSection";
import { NotificationsSection } from "./sections/NotifciationsSection";

enum TabPhase {
  MINT,
  RELEASE,
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
        <ButtonsSection />
        <Section header="Paper">
          <BridgePaper>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              indicatorColor="primary"
              variant="fullWidth"
            >
              <Tab label={tab === TabPhase.MINT ? "Minting" : "Mint"} />
              <Tab label={tab === TabPhase.RELEASE ? "Releasing" : "Release"} />
            </Tabs>
            {tab === TabPhase.MINT && (
              <div>
                <Box height={200}>
                  <Box pb={1}>
                    <AssetDropdown mode="send" defaultValue="BTC" />
                  </Box>
                  <AssetDropdown mode="chain" defaultValue="ETHC" />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Next
                </Button>
              </div>
            )}
            {tab === TabPhase.RELEASE && (
              <div>
                <Box height={200}>
                  <AssetDropdown mode="receive" defaultValue="BCH" />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Next
                </Button>
              </div>
            )}
          </BridgePaper>
        </Section>
        <NotificationsSection />
        <Section header="Typography">
          <Cartesian
            Component={Typography}
            content={({ variant }) => variant}
            elementWrapperStyle={{ display: "block" }}
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
              <Typography color="primary" component="span">
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
              <Typography color="secondary" component="span">
                opened
              </Typography>
            </Tooltip>{" "}
            on hover. <br />
            <Tooltip placement="bottom-start" title="like that">
              <Typography color="primary" component="span">
                Bottom placement
              </Typography>
            </Tooltip>{" "}
            is also possible.
          </Typography>
        </Section>
        <IconsSection />
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
