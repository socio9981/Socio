import { IonIcon } from "@ionic/react";
import { logInOutline } from "ionicons/icons";

import { createActor, socio_backend } from "../../../../declarations/socio_backend/index";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { useIonLoading, useIonToast, IonButton } from "@ionic/react";
import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../store/GlobalStore";

import { authWithII } from "./auth";
import { Capacitor } from "@capacitor/core";
 
export default function Login() {

    const { dispatch } = useContext(GlobalContext);

    var actor1 = socio_backend;

    const [actor, setActor] = useState(null);
    const [II_URL, setII_URL] = useState("");
    const [inLogin, setInLogin] = useState(false);

    const [present, dismiss] = useIonLoading();
    const [presentToast] = useIonToast();

    useEffect(() => {
        if (process.env.DFX_NETWORK === "local") {
            // Local url for providing internet identity only in chrome.
            setII_URL(`http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`);
        } else if (process.env.DFX_NETWORK === "ic") {
            setII_URL("https://identity.ic0.app");
        } else {
            setII_URL(`https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`);
        }
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        await present({ message: "Logging in..." });
      
        try {
          let identity;
          if (Capacitor.isNativePlatform()) {
            identity = await nativeLogin();
          } else {
            identity = await webLogin();
          }
      
          const agent = new HttpAgent({ identity });
          const actor = createActor(process.env.CANISTER_ID_SOCIO_BACKEND, { agent });
      
          setActor(actor);
          const currentUser = await actor.getUser();
          dispatch({ type: 'SET_ACTOR', payload: actor });
          dispatch({ type: 'SET_USER', payload: currentUser.length ? currentUser[0] : currentUser });
          dispatch({ type: 'SET_LOGGED_IN', payload: true });
      
          dismiss();
        } catch (error) {
          console.error('Login failed:', error);
          presentToast({
            message: "An error occurred during login",
            duration: 3000,
            color: "danger",
          });
        } finally {
          setInLogin(false);
        }
      }
      
      async function webLogin() {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
          return authClient.getIdentity();
        }
        await new Promise((resolve, reject) => {
          authClient.login({
            identityProvider: II_URL,
            onSuccess: resolve,
            onError: reject
          });
        });
        return authClient.getIdentity();
      }
      
      async function nativeLogin() {
        const sessionIdentity = Ed25519KeyIdentity.generate();
        const { identity } = await authWithII({
          url: II_URL,
          sessionIdentity,
        });
        console.log("Identity:",identity);
        return identity;
      }

    return (
        <button className="btn login-btn" id="Login" disabled={inLogin} onClick={(e) => handleLogin(e)}>
            <IonIcon icon={logInOutline} slot="start" />
            Login
        </button>
    )
}