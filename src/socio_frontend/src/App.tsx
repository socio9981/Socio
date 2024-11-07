// import { IonApp, setupIonicReact } from '@ionic/react';
// import Home from './pages/Home.jsx';

// /* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

// /* Basic CSS for apps built with Ionic */
// import '@ionic/react/css/normalize.css';
// import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';

// /* Optional CSS utils that can be commented out */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

// /**
//  * Ionic Dark Mode
//  * -----------------------------------------------------
//  * For more info, please see:
//  * https://ionicframework.com/docs/theming/dark-mode
//  */

// /* import '@ionic/react/css/palettes/dark.always.css'; */
// /* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

// /* Theme variables */
// import './theme/variables.scss';
// import LandingPage from './pages/LandingPage/LandingPage.jsx';
// import { useEffect, useState, useContext } from 'react';

// import { GlobalContext, GlobalProvider } from './store/GlobalStore.jsx';
// import { Preferences } from '@capacitor/preferences';
// import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
// setupIonicReact();

// const App: React.FC = () => {
//   const { state, dispatch } = useContext(GlobalContext);
//   const { theme, actor, loggedIn, user } = state;

//   useEffect(() => {
//     const applyTheme = async () => {
//       const { value: savedTheme } = await Preferences.get({ key: 'color-theme' });
//       const themeToApply = savedTheme || 'dark'; // Default to 'dark' if no theme is set
//       document.body.setAttribute('color-theme', themeToApply);
//       dispatch({ type: 'SET_THEME', payload: themeToApply });
//     };
//     applyTheme();

//     const updateScreenType = () => {
//       const width = window.innerWidth;
//       if (width <= 768) {
//         dispatch({ type: 'SET_SCREEN_TYPE', payload: 'mobile' });
//       } else if (width <= 1024) {
//         dispatch({ type: 'SET_SCREEN_TYPE', payload: 'tablet' });
//       } else {
//         dispatch({ type: 'SET_SCREEN_TYPE', payload: 'desktop' });
//       }
//     };

//     window.addEventListener('resize', updateScreenType);
//     updateScreenType(); // Call once to set initial state

//     return () => window.removeEventListener('resize', updateScreenType);
//   }, [dispatch]);

//   const toggleTheme = async () => {
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     document.body.setAttribute('color-theme', newTheme);
//     dispatch({ type: 'SET_THEME', payload: newTheme });
//     await Preferences.set({ key: 'color-theme', value: newTheme });
//   };

//   return (
//     <IonApp>
//       {
//         loggedIn ?
//           (user !== null && user.length !== 0)  ?
//             <Home toggleTheme={toggleTheme} />
//             : <RegistrationPage />
//           : <LandingPage />
//       }
//     </IonApp>
//   );
// };

// const AppWrapper: React.FC = () => (
//   <GlobalProvider>
//     <App />
//   </GlobalProvider>
// );

// export default AppWrapper;

import React, { useEffect, useContext, useState } from 'react';
import { IonApp, setupIonicReact, useIonLoading } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import Home from './pages/Home.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
import { GlobalContext, GlobalProvider } from './store/GlobalStore.jsx';
import { Preferences } from '@capacitor/preferences';

import { AuthClient } from '@dfinity/auth-client';

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

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.scss';
import { createActor } from '../../declarations/socio_backend/index.js';
import { HttpAgent } from '@dfinity/agent';

setupIonicReact();

const App: React.FC = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { theme, loggedIn, user } = state;

  const [present, dismiss] = useIonLoading();

  const [II_URL, setII_URL] = useState("");

  useEffect(() => {
    if (process.env.DFX_NETWORK === "local") {
      setII_URL(`http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`);
    } else if (process.env.DFX_NETWORK === "ic") {
      setII_URL("https://identity.ic0.app");
    } else {
      setII_URL(`https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`);
    }
  }, []);

  async function login() {
    present({ message: 'Logging in...' });
    CapApp.addListener('appUrlOpen', async (data: any) => {
      console.log('Deep link opened', data);

      // Check if the URL is related to Internet Identity
      if (data.url.includes('internetidentity://')) {
        // Parse the URL to extract authentication data
        const url = new URL(data.url);
        const authResult = url.searchParams.get('auth_result');

        if (authResult) {
          try {
            // Decode and parse the auth result
            const decodedResult = JSON.parse(atob(authResult));

            // Create a new AuthClient and login
            const authClient = await AuthClient.create();
            await authClient.login({
              identityProvider: II_URL,
              onSuccess: async () => {
                // Update your app's state
                const identity = authClient.getIdentity();
                const agent = new HttpAgent({ identity });
                const canisterId = process.env.CANISTER_ID_SOCIO_BACKEND;
                if (!canisterId) {
                  throw new Error("CANISTER_ID_SOCIO_BACKEND is not defined");
                }
                const actor = createActor(canisterId, {
                  agent,
                });
                dispatch({ type: 'SET_ACTOR', payload: actor });
                dispatch({ type: 'SET_LOGGED_IN', payload: true });

                const currentUser = await actor.getUser();
                if (currentUser.length === 0) {
                  dispatch({ type: 'SET_USER', payload: currentUser });
                } else {
                  dispatch({ type: 'SET_USER', payload: currentUser[0] });
                }

                // Navigate to the appropriate page
                // You might need to use Ionic's navigation here
                // For example: history.push('/home');
              },
              onError: (error: any) => {
                console.error('Login error:', error);
                // Handle login error (show a message to the user, etc.)
              }
            });
          } catch (error) {
            console.error('Error processing auth result:', error);
            // Handle error (show a message to the user, etc.)
          }
        }
        dismiss();
      }
    });
  }

  useEffect(() => {
    const applyTheme = async () => {
      const { value: savedTheme } = await Preferences.get({ key: 'color-theme' });
      const themeToApply = savedTheme || 'dark';
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
    updateScreenType();

    // Add deep link listener for Internet Identity authentication
    if (Capacitor.isNativePlatform()) {
      login();
    }

    return () => {
      window.removeEventListener('resize', updateScreenType);
      if (Capacitor.isNativePlatform()) {
        CapApp.removeAllListeners();
      }
    };
  }, [dispatch]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('color-theme', newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
    await Preferences.set({ key: 'color-theme', value: newTheme });
  };

  return (
    <IonApp>
      {loggedIn ?
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