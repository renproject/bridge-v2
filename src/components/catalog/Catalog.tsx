import { Button, Typography } from '@material-ui/core'
import React, { FunctionComponent } from 'react'

export const Catalog: FunctionComponent = () => {
  return (
    <div>
      <Typography variant="h1">Component Catalog</Typography>
      <Typography variant="h2">Buttons</Typography>
      <Button variant="outlined" color="primary" disabled>Inactive</Button>
      <Button variant="outlined" color="primary">Normal</Button>
    </div>
  );
};
