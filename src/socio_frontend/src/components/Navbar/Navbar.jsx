import { useEffect, useState, useContext } from "react";
import { IonContent, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonIcon, IonLabel, IonTab, IonButton, IonPage } from "@ionic/react";
import {
    addCircleOutline, addCircle,
    chatbubblesOutline, chatbubble,
    compassOutline, compass,
    ellipsisHorizontalOutline, ellipsisHorizontal,
    homeOutline, home,
    notificationsOutline, notifications,
    personOutline, person,
    searchOutline, search,
    settings,
    logOut,
} from "ionicons/icons";
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router';
import HomePage from "../../pages/HomePage/HomePage";
import ChatPage from "../../pages/ChatPage/ChatPage";
import ExplorePage from "../../pages/ExplorePage/ExplorePage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import CreateComponent from "../CreateComponent/CreateComponent";

import './Navbar.scss';
import SideBarModal from "../SideBarModal/SideBarModal";

import { GlobalContext } from "../../store/GlobalStore";
import NotificationsPage from "../../pages/NotificationsPage/NotificationsPage";

export default function Navbar({ activeMenuItem, setActiveMenuItem, chatButtonRef, notificationButtonRef }) {

    const { state } = useContext(GlobalContext);
    const { user } = state;

    const [currentUser, setCurrentUser] = useState(null);
    const [profileType, setProfileType] = useState(null);

    const buttons = [
        { tab: 'home', href: '/', icon: home, outlineIcon: homeOutline, label: 'Home' },
        { tab: 'search', href: '/search', icon: search, outlineIcon: searchOutline, label: 'Search' },
        { tab: 'create', href: '/create', icon: addCircle, outlineIcon: addCircleOutline, label: 'Create' },
        { tab: 'explore', href: '/explore', icon: compass, outlineIcon: compassOutline, label: 'Explore' },
        { tab: 'profile', href: '/profile', icon: person, outlineIcon: personOutline, label: 'Profile' },
        { tab: 'chat', href: '/chat', label: 'Chat' },
        { tab: 'notifications', href: '/notifications', label: 'notifications' }
    ];

    const [isCreateModalOpen, setCreateComponent] = useState(false);

    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    return (
        <IonContent id="NavBar">

            <IonReactRouter>

                <IonTabs>
                    <IonRouterOutlet id="router-outlet">
                        <Route exact={true} path="/" render={() => <HomePage />} />
                        <Route exact={true} path="/search" render={() => <SideBarModal type="search" />} />
                        <Route exact={true} path="/create" render={() => <CreateComponent isOpen={isCreateModalOpen} onClose={() => {
                            setCreateComponent(false);
                        }} />} />
                        <Route exact={true} path="/chat" render={() => <IonPage>
                            <ChatPage />
                        </IonPage>} />
                        <Route exact={true} path="/explore" render={() => <ExplorePage />} />
                        <Route exact={true} path="/notifications" render={() => <IonPage>
                            <SideBarModal type="notifications" />
                        </IonPage>} />
                        <Route exact={true} path="/profile" render={() => <ProfilePage profileUser={currentUser} type={profileType} />} />
                        <Route exact={true} path="/profile:username" render={() => <ProfilePage profileUser={currentUser} type={profileType} />} />
                    </IonRouterOutlet>

                    <IonTabBar slot="bottom">

                        {
                            buttons.map((button) => {
                                return <IonTabButton ref={
                                    chatButtonRef
                                } key={button.tab} tab={button.tab} href={button.href} onClick={() => {
                                    setActiveMenuItem(button.tab)
                                    if (button.tab === 'create') {
                                        setCreateComponent(true);
                                    };
                                    if (button.tab === 'profile') {
                                        setProfileType('self');
                                    };
                                }} className={activeMenuItem === button.tab ? "active-nav-item" : ""}>
                                    <IonIcon icon={activeMenuItem === button.tab ? button.icon : button.outlineIcon} />
                                    <IonLabel>{button.label}</IonLabel>
                                </IonTabButton>
                            })
                        }

                    </IonTabBar>
                </IonTabs>
            </IonReactRouter>
        </IonContent>
    )
}