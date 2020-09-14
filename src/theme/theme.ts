import { createMuiTheme, responsiveFontSizes } from '@material-ui/core'
import { overrides } from './overrides'
import { props } from './props'

let theme = createMuiTheme({
  props,
  overrides,
})

theme = responsiveFontSizes(theme)

export { theme }
