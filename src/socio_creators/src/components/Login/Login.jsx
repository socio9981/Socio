import { IonIcon } from "@ionic/react";
import { logInOutline } from "ionicons/icons";

import { createActor, socio_backend } from "../../../../declarations/socio_backend/index";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { useIonLoading, useIonToast, IonButton } from "@ionic/react";
import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../store/GlobalStore";

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

    async function login(authClient) {
        setInLogin(true);
        await present({ message: "Logging in..." });
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });
        actor1 = createActor(process.env.CANISTER_ID_SOCIO_BACKEND, {
            agent,
        });

        setActor(actor1);
        const currentUser = await actor1.getUser();
        dispatch({ type: 'SET_ACTOR', payload: actor1 });
        if (currentUser.length === 0) {
            dispatch({ type: 'SET_USER', payload: currentUser });
        } else {
            dispatch({ type: 'SET_USER', payload: currentUser[0] });
        }

        dispatch({ type: 'SET_LOGGED_IN', payload: true });
        setInLogin(false);
        dismiss();
    };

    async function handleLogin(e) {
        e.preventDefault();
        // creating an authentication client.
        let authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
            await login(authClient);
        } else {
            try {
                await new Promise((resolve, reject) => {
                    authClient.login({
                        identityProvider: II_URL,
                        onSuccess: resolve,
                        onError: reject
                    })
                })

                await login(authClient);
            } catch (error) {
                console.error('An error occurred during login:', error);
                presentToast({
                    message: "An error occurred during login",
                    duration: 3000,
                    color: "danger",
                })
            }
        }
    }

    return (
        <button className="btn login-btn" id="Login" disabled={inLogin} onClick={(e) => handleLogin(e)}>
            <IonIcon icon={logInOutline} slot="start" />
            Login
        </button>
    )
}