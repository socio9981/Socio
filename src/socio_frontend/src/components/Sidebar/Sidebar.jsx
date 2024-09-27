import { useState, useContext, useEffect, createRef, useRef } from "react";
import { IonCard, IonList, IonIcon, IonItem, IonCardContent, IonToggle, IonRouterLink } from "@ionic/react";
import { Link } from "react-router-dom";
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
import socio_logo_rect_black from "../../../src/images/socio_rect_logos/black_rect.png";
import socio_logo_rect_white from "../../../src/images/socio_rect_logos/white_rect.png";
import socio_logo_sqar_black from "../../../src/images/socio_sqar_logos/black_sqar.png";
import socio_logo_sqar_white from "../../../src/images/socio_sqar_logos/white_sqar.png";

import './Sidebar.scss';
import { GlobalContext } from "../../store/GlobalStore";
import CreateComponent from "../CreateComponent/CreateComponent";

export default function Sidebar({ sideBar, setSideBar, toggleTheme, activeMenuItem, setActiveMenuItem, setUser, setProfileType, setSearchProfileOpen }) {

    const { state } = useContext(GlobalContext);
    const { theme, screenType, user } = state;

    const [showMoreOptions, setShowMoreOptions] = useState(false);

    const [isCreateModalOpen, setCreateComponent] = useState(false);

    const moreOptionsRef = useRef(null);

    const [lastActiveMenuItem, setLastActiveMenuItem] = useState(null);
    const [lastSideBar, setLastSideBar] = useState(null);

    const menuItems = [
        { key: 'home', icon: home, iconOutline: homeOutline, label: 'Home', sideBarState: 'max', path: '/' },
        { key: 'search', icon: search, iconOutline: searchOutline, label: 'Search', sideBarState: 'min', path: '' },
        { key: 'chat', icon: chatbubble, iconOutline: chatbubblesOutline, label: 'Chat', sideBarState: 'min', path: '/chat' },
        { key: 'explore', icon: compass, iconOutline: compassOutline, label: 'Explore', sideBarState: 'min', path: '/explore' },
        { key: 'notifications', icon: notifications, iconOutline: notificationsOutline, label: 'Notifications', sideBarState: 'min', path: '' },
        { key: 'create', icon: addCircle, iconOutline: addCircleOutline, label: 'Create', sideBarState: 'max', path: '' },
        { key: 'profile', icon: person, iconOutline: personOutline, label: 'Profile', sideBarState: 'max', path: '/profile' },
    ];

    const SidebarItem = ({ icon, iconOutline, label, isActive, path, onClick }) => {
        return (
            path !== '' ?
                <Link to={path}>
                    <IonItem className={isActive ? "active-item" : ""} onClick={onClick}>
                        <IonIcon icon={isActive ? icon : iconOutline} slot="start" />
                        <p className="icon-label">{label}</p>
                    </IonItem>
                </Link>
                :
                <IonItem className={isActive ? "active-item" : ""} onClick={onClick}>
                    <IonIcon icon={isActive ? icon : iconOutline} slot="start" />
                    <p className="icon-label">{label}</p>
                </IonItem>
        );
    };


    const toggleMoreOptions = () => {
        setShowMoreOptions(!showMoreOptions);
    };

    const handleClickOutside = (event) => {
        if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
            setShowMoreOptions(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <IonCard className={"sidebar " + `${sideBar}`} style={{ width: sideBar === 'max' ? '15%' : '5%' }}>
            <IonList lines='none' id="sidebar-menu">
                <IonItem>
                    <img src={theme === 'dark'
                        ? sideBar === "max" ? socio_logo_rect_black : socio_logo_sqar_black
                        : sideBar === "max" ? socio_logo_rect_white : socio_logo_sqar_white} alt="socio_logo"
                    />
                </IonItem>
                {menuItems.map(item => (
                    <SidebarItem
                        key={item.key}
                        icon={item.icon}
                        iconOutline={item.iconOutline}
                        label={item.label}
                        isActive={activeMenuItem === item.key}
                        path={item.path}
                        onClick={() => {
                            setSideBar(item.sideBarState);
                            if (item.key !== 'create') {
                                setLastActiveMenuItem(item.key);
                                setLastSideBar(item.sideBarState);
                            };
                            if(item.key === 'search' || item.key === 'notifications'){
                                setSearchProfileOpen(false);
                            };
                            if(item.key === 'profile'){
                                setProfileType('self');
                                setUser(user);
                            }
                            setActiveMenuItem(item.key);
                            if (item.key === 'create') {
                                setCreateComponent(true);
                            };
                        }}
                    />
                ))}
                
                <CreateComponent isOpen={isCreateModalOpen} onClose={() => {
                    setCreateComponent(false);
                    setActiveMenuItem(lastActiveMenuItem);
                    if (screenType !== 'desktop') {
                        setSideBar(lastSideBar);
                    }
                }} />

                <div className="more-icon-container">
                    <IonItem id="more-icon" onClick={toggleMoreOptions}>
                        <IonIcon icon={ellipsisHorizontalOutline} slot="start" />
                        <p className="icon-label">More</p>
                    </IonItem>
                    {showMoreOptions && (
                        <IonCard className="more-options-card" ref={moreOptionsRef}>
                            <IonCardContent>
                                <IonList>
                                    <IonItem>
                                        <IonIcon icon={settings} slot="start" />
                                        <p className="icon-label">Settings</p>
                                    </IonItem>
                                    <IonItem>
                                        <IonIcon icon={person} slot="start" />
                                        <p className="icon-label">Switch Account</p>
                                    </IonItem>
                                    <IonItem>
                                        <IonToggle slot="start" onIonChange={() => toggleTheme()}></IonToggle>
                                        <p className="icon-label appearance">Appearance</p>
                                    </IonItem>
                                    <IonItem>
                                        <IonIcon icon={logOut} slot="start" />
                                        <p className="icon-label">Log Out</p>
                                    </IonItem>
                                </IonList>
                            </IonCardContent>
                        </IonCard>
                    )}
                </div>
            </IonList>
        </IonCard>
    );
}