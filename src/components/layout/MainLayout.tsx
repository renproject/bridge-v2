import { Drawer, ListItem } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles, Theme } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import MenuIcon from '@material-ui/icons/Menu'
import React, { FunctionComponent } from 'react'
import { TransactionHistoryMenuIconButton, WalletConnectionStatusButton, } from '../buttons/Buttons'
import { RenBridgeLogoIcon } from '../icons/RenIcons'

const useStyles = makeStyles((theme: Theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  logo: {
    display: "flex",
    alignItems: "center",
  },
  desktopMenu: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },
  desktopTxHistory: {
    marginRight: 20,
  },
  mobileMenu: {
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  drawer: {},
}));

export const MainLayout: FunctionComponent = ({ children }) => {
  const styles = useStyles();
  const [
    mobileMoreAnchorEl,
    setMobileMoreAnchorEl,
  ] = React.useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleDrawerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // TODO: remove
  const mobileDrawerId = "main-menu-mobile";
  const renderMobileMenu = (
    <Drawer
      anchor="right"
      id={mobileDrawerId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <ListItem>
        <WalletConnectionStatusButton />
        <p>Messages</p>
      </ListItem>
      <ListItem>
        <TransactionHistoryMenuIconButton />
        <p>Notifications</p>
      </ListItem>
    </Drawer>
  );

  return (
    <div className={styles.grow}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <div className={styles.logo}>
            <RenBridgeLogoIcon />
          </div>
          <div className={styles.grow} />
          <div className={styles.desktopMenu}>
            <TransactionHistoryMenuIconButton
              className={styles.desktopTxHistory}
            />
            <WalletConnectionStatusButton />
          </div>
          <div className={styles.mobileMenu}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileDrawerId}
              aria-haspopup="true"
              onClick={handleDrawerOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {children}
    </div>
  );
};
