import { IonApp, setupIonicReact } from '@ionic/react';
import Home from './pages/Home.jsx';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.scss';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import { useEffect, useState, useContext } from 'react';

import { GlobalContext, GlobalProvider } from './store/GlobalStore.jsx';
import { Preferences } from '@capacitor/preferences';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';

import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

setupIonicReact();

const App: React.FC = () => {

  const { state, dispatch } = useContext(GlobalContext);
  const { theme, actor, loggedIn, user } = state;

  useEffect(() => {
    const applyTheme = async () => {
      const { value: savedTheme } = await Preferences.get({ key: 'color-theme' });
      const themeToApply = savedTheme || 'dark'; // Default to 'dark' if no theme is set
      document.body.setAttribute('color-theme', themeToApply);
      dispatch({ type: 'SET_THEME', payload: themeToApply });
    };
    applyTheme();

    const updateScreenType = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        dispatch({ type: 'SET_SCREEN_TYPE', payload: 'mobile' });
      } else if (width <= 1024) {
        dispatch({ type: 'SET_SCREEN_TYPE', payload: 'tablet' });
      } else {
        dispatch({ type: 'SET_SCREEN_TYPE', payload: 'desktop' });
      }
    };

    window.addEventListener('resize', updateScreenType);
    updateScreenType(); // Call once to set initial state

    return () => window.removeEventListener('resize', updateScreenType);
  }, [dispatch]);

  useEffect(() => {
    CapApp.addListener('appUrlOpen', (event) => {
      const url = event.url;
      
      // Assuming the redirection URL contains delegation data in query parameters
      if (url.startsWith('io.ionic.starter://')) {
        // Parse the URL to extract the delegation token or relevant data
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const delegationToken = urlParams.get('delegationToken'); // Example parameter

        // You may want to close the browser here if needed
        Browser.close();

        // Now use this token to complete the authentication in your app
        handleAuthWithDelegation(delegationToken);
      }
    });
  }, []);

  const handleAuthWithDelegation = (delegationToken: string | null) => {
    // Use the delegation token to authenticate the user in the app
    console.log('Received delegation token:', delegationToken);
  };


  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('color-theme', newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
    await Preferences.set({ key: 'color-theme', value: newTheme });
  };

  return (
    <IonApp>
      {
        loggedIn ?
          (user !== null && user.length !== 0) ?
            <Home toggleTheme={toggleTheme} />
            : <RegistrationPage />
          : <LandingPage />
      }
    </IonApp>
  );
};

const AppWrapper: React.FC = () => (
  <GlobalProvider>
    <App />
  </GlobalProvider>
);

export default AppWrapper;
