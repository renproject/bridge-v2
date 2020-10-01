import Card from '@material-ui/core/Card'
import { makeStyles } from '@material-ui/core/styles'
import React from 'react'
import { Debug } from '../utils/Debug'

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up("sm")]: {
      minWidth: "344px !important",
    },
  },
  card: {
    backgroundColor: "#fddc6c",
    width: "100%",
  },
  typography: {
    fontWeight: "bold",
  },
  actionRoot: {
    padding: "8px 8px 8px 16px",
  },
  icons: {
    marginLeft: "auto",
  },
  expand: {
    padding: "8px 8px",
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  collapse: {
    padding: 16,
  },
  checkIcon: {
    fontSize: 20,
    color: "#b3b3b3",
    paddingRight: 4,
  },
  button: {
    padding: 0,
    textTransform: "none",
  },
}));

export const CustomSnackMessage = React.forwardRef((props, ref) => {
  const classes = useStyles();
  // const { closeSnackbar } = useSnackbar();
  // const [expanded, setExpanded] = useState(false);
  return (
    <Card className={classes.card} ref={ref}>
      <Debug it={{ props }} />
    </Card>
  );
});
