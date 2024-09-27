import { IonCard } from "@ionic/react";

import './SideBarModal.css';
import SearchPage from "../../pages/SearchPage/SearchPage";
import NotificationsPage from "../../pages/NotificationsPage/NotificationsPage";

export default function SideBarModal({ type, setUser, setProfileType, setSearchProfileOpen }) {

    return (
        <IonCard id="SideBarModal">
            {
                type === 'search' ?
                    <SearchPage setUser={setUser} setProfileType={setProfileType} setSearchProfileOpen={setSearchProfileOpen} />
                    : <NotificationsPage setUser={setUser} setProfileType={setProfileType} setSearchProfileOpen={setSearchProfileOpen} />
            }
        </IonCard>
    )
}