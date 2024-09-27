import { IonContent, IonPage, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { chatbubble, chatbubbleOutline, notifications, notificationsOutline } from 'ionicons/icons';
import { Redirect, BrowserRouter as Router, useHistory } from 'react-router-dom';
import './Home.css';
import Sidebar from '../components/Sidebar/Sidebar';
import { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from '../store/GlobalStore';
import Mainsection from '../components/Mainsection/Mainsection';
import Navbar from '../components/Navbar/Navbar';
import SideBarModal from '../components/SideBarModal/SideBarModal';

import socio_logo_rect_black from "../../src/images/socio_rect_logos/black_rect.png";
import socio_logo_rect_white from "../../src/images/socio_rect_logos/white_rect.png";
import socio_logo_sqar_black from "../../src/images/socio_sqar_logos/black_sqar.png";
import socio_logo_sqar_white from "../../src/images/socio_sqar_logos/white_sqar.png";

export default function Home({ toggleTheme }) {

  const { state } = useContext(GlobalContext);
  const { screenType, theme } = state;

  const [sideBar, setSideBar] = useState("max");
  const [activeMenuItem, setActiveMenuItem] = useState('home');

  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);

  const [searchProfileOpen, setSearchProfileOpen] = useState(false);

  const chatRef = useRef(null);
  const notificationRef = useRef(null);

  const chatClick = () => {
    if (chatRef.current) {
      chatRef.current.click();
    }
  };

  const notificationClick = () => {
    if (notificationRef.current) {
      notificationRef.current.click();
    }
  };
  return (
    <IonPage id='home'>
      <Router>
        <div id='container'>
          {
            screenType === 'desktop' &&
            <>
              <Sidebar sideBar={sideBar} setSideBar={setSideBar} toggleTheme={toggleTheme} activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem} setUser={setUser} setProfileType={setProfileType} setSearchProfileOpen={setSearchProfileOpen} />
              {['search', 'notifications'].includes(activeMenuItem) && !searchProfileOpen && (
                <SideBarModal sideBar={sideBar} type={activeMenuItem === 'search' ? 'search' : 'notifications'} setUser={setUser} setProfileType={setProfileType} setSearchProfileOpen={setSearchProfileOpen} />
              )}
            </>
          }

          {
            screenType === 'desktop' && <Mainsection user={user} profileType={profileType} />
          }

          {
            screenType !== 'desktop' &&
            <>
              <div id="top-nav-bar">

                <div slot="top">

                  <IonTabButton tab='logo' href='/' className='top-nav-item-0'>
                    <img src={theme === 'dark'
                      ? sideBar === "max" ? socio_logo_rect_black : socio_logo_sqar_black
                      : sideBar === "max" ? socio_logo_rect_white : socio_logo_sqar_white} alt="socio_logo"
                    />
                  </IonTabButton>

                  <div onClick={() => {
                    setActiveMenuItem('chat')
                    chatClick()
                  }
                  } className={`top-nav-item-1 ${activeMenuItem === 'chat' ? 'active-icon-top' : ''}`}>
                    <IonIcon icon={activeMenuItem === 'chat' ? chatbubble : chatbubbleOutline} />
                  </div>

                  <div tab="notifications" onClick={() => {
                    setActiveMenuItem('notifications')
                    notificationClick()
                  }} className={`top-nav-item-2 ${activeMenuItem === 'notifications' ? 'active-icon-top' : ''}`} >
                    <IonIcon icon={activeMenuItem === 'notifications' ? notifications : notificationsOutline} />
                  </div>
                </div>
              </div>
              <Navbar activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem} chatButtonRef={chatRef} notificationButtonRef={notificationRef} />
            </>
          }
        </div>
      </Router>
    </IonPage>
  );
};