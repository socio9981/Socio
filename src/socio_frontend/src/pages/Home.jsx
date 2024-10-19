import { IonContent, IonPage, IonTabButton, IonIcon, IonTabBar } from '@ionic/react';
import { chatbubble, chatbubbleOutline, notifications, notificationsOutline } from 'ionicons/icons';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import './Home.css';
import Sidebar from '../components/Sidebar/Sidebar';
import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../store/GlobalStore';
import Mainsection from '../components/Mainsection/Mainsection';
import Navbar from '../components/Navbar/Navbar';
import SideBarModal from '../components/SideBarModal/SideBarModal';

import socio_logo_rect_black from "../../src/images/socio_rect_logos/black_rect.png";
import socio_logo_rect_white from "../../src/images/socio_rect_logos/white_rect.png";
import socio_logo_sqar_black from "../../src/images/socio_sqar_logos/black_sqar.png";
import socio_logo_sqar_white from "../../src/images/socio_sqar_logos/white_sqar.png";
import { IonReactRouter } from '@ionic/react-router';

export default function Home({ toggleTheme }) {

  const { state } = useContext(GlobalContext);
  const { screenType, theme } = state;

  const [sideBar, setSideBar] = useState("max");
  const [activeMenuItem, setActiveMenuItem] = useState('home');

  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);

  const [searchProfileOpen, setSearchProfileOpen] = useState(false);

  return (
    <IonPage id='home'>
      <IonReactRouter>
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
                <div>
                  <div className='top-nav-item-0'>
                    <img src={theme === 'dark'
                      ? sideBar === "max" ? socio_logo_rect_black : socio_logo_sqar_black
                      : sideBar === "max" ? socio_logo_rect_white : socio_logo_sqar_white} alt="socio_logo"
                    />
                  </div>

                  <div className='top-nav-item-1' onClick={() => setActiveMenuItem('chat')}>
                      <Link to='chat'>
                        <IonIcon icon={
                          activeMenuItem === 'chat' ? chatbubble : chatbubbleOutline
                        } />
                      </Link>
                  </div>

                  <div className='top-nav-item-2' onClick={() => setActiveMenuItem('notifications')}>
                      <Link to='/notifications'>
                        <IonIcon icon={
                          activeMenuItem === 'notifications' ? notifications : notificationsOutline
                        } />
                      </Link>
                  </div>

                </div>
              </div>
              
              <Navbar activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem} setUser={setUser} profileType={profileType} setProfileType={setProfileType} setSearchProfileOpen={setSearchProfileOpen} />
            </>
          }
        </div>
      </IonReactRouter>
    </IonPage>
  );
};