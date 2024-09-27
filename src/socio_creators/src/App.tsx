import { IonApp, IonButton, setupIonicReact } from '@ionic/react';
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
import { useEffect, useState, useContext } from 'react';

import { GlobalContext, GlobalProvider } from './store/GlobalStore.jsx';
import { Preferences } from '@capacitor/preferences';
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

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('color-theme', newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
    await Preferences.set({ key: 'color-theme', value: newTheme });
  };

  return (
    <IonApp>
      <Home />
    </IonApp>
  );
};

const AppWrapper: React.FC = () => (
  <GlobalProvider>
    <App />
  </GlobalProvider>
);

export default AppWrapper;