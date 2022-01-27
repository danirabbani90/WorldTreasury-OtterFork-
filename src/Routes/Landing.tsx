import { ThemeProvider } from '@material-ui/core';
import { OttoThemeContextProvider } from 'src/hooks/theme';
import { useThemeChangedByTime } from 'src/hooks/theme';
import { ScrollToTop } from 'src/helpers';
import { Route, Switch } from 'react-router-dom';
import { dark as darkTheme } from 'src/themes/app';
import { NFT, Otto, Stake } from 'src/views';
import Landing from '../views/Landing';
import './style.scss';
import App from './App';

function Appx() {
  const theme = useThemeChangedByTime();
  return (
    <ScrollToTop>
      <Switch>
        <Route exact path="/nft">
          <ThemeProvider theme={darkTheme}>
            <NFT />
          </ThemeProvider>
        </Route>
        <Route exact path="/otto">
          <OttoThemeContextProvider value={theme}>
            <ThemeProvider theme={theme.theme}>
              <Otto />
            </ThemeProvider>
          </OttoThemeContextProvider>
        </Route>
        <ThemeProvider theme={theme.theme}>
          <Route component={App} />
        </ThemeProvider>
      </Switch>
    </ScrollToTop>
  );
}

export default Appx;
