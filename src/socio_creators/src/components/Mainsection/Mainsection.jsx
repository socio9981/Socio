import { IonCard } from "@ionic/react";
import './Mainsection.css';
import { IonRouterOutlet } from "@ionic/react";
import { Route } from 'react-router-dom';
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../store/GlobalStore";

import HomePage from "../HomePage/HomePage";

export default function Mainsection() {

    const { state } = useContext(GlobalContext);

    return (
        <IonCard id="mainsection">
            <IonRouterOutlet>
                <Route exact={true} path="/" render={() => <HomePage />} />
                {/* <Route exact={true} path="/profile" render={<ProfilePage />} /> */}
            </IonRouterOutlet>
        </IonCard>
    );
};