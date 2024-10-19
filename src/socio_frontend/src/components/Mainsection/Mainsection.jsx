import { IonCard } from "@ionic/react";
import './Mainsection.css';
import { IonRouterOutlet } from "@ionic/react";
import { Route } from 'react-router-dom';
import HomePage from "../../pages/HomePage/HomePage";
import ExplorePage from "../../pages/ExplorePage/ExplorePage";
import ChatPage from "../../pages/ChatPage/ChatPage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../store/GlobalStore";

export default function Mainsection({ user, profileType }) {

    const { state } = useContext(GlobalContext);

    return (
        <IonCard id="mainsection">
            <IonRouterOutlet>
                <Route exact={true} path="/" render={() => <HomePage />} />
                <Route exact={true} path="/chat" render={() => <ChatPage />} />
                <Route exact={true} path="/explore" render={() => <ExplorePage />} />
                <Route exact={true} path="/profile" render={() => <ProfilePage profileUser={user} type={profileType} />} />
                <Route exact={true} path="/profile/:username" render={() => <ProfilePage profileUser={user} type={profileType} />} />
            </IonRouterOutlet>
        </IonCard>
    );
};