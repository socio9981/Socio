import { useContext, useEffect } from "react";
import { GlobalContext } from "../../store/GlobalStore";
import { IonButton, IonButtons } from "@ionic/react";
import Login from "../Login/Login";

import './CreatorSigning.scss';

import content_creator from '../../images/illustrations/content_creator.jpg';

export default function CreatorSigning() {

    const { state } = useContext(GlobalContext);

    return (
        <div className="creator-signing">
            <div className="logo-container">
                <img src={content_creator} alt="creator-logo" />
            </div>
            <IonButtons className="button-container">
                <p>Login As a Creator</p>
                <Login />
            </IonButtons>
        </div>
    );
} 