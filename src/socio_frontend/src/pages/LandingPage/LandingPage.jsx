import { IonContent, IonIcon, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonImg, IonToggle, IonMenu, IonMenuButton, IonList, IonItem, IonGrid, IonRow, IonCol, IonCard, IonFooter, IonSkeletonText } from '@ionic/react';
import { useEffect, useState, useContext } from 'react';
import socio_logo_black from '../../../src/images/socio_logo_black_bg_word.png';
import socio_logo_white from '../../../src/images/socio_logo_white_bg_word.png';
import social_media_illustration from '../../../src/illustrations/Social media-amico.png';
import about_svg from '../../../src/illustrations/About us.png';
import decentralized_icon from '../../../src/illustrations/decentralized_icon.png';
import privacy_icon from '../../../src/illustrations/privacy_icon.png';
import security_icon from '../../../src/illustrations/security_icon.png';
import transparency_icon from '../../../src/illustrations/transparency_icon.png';
import trust_icon from '../../../src/illustrations/trust_icon.png';
import aiml_icon from '../../../src/features/ai-ml-icon.png';
import content_creator_icon from '../../../src/features/content-creator-icon.png';
import file_viewing_icon from '../../../src/features/file-viewing-icon.png';
import messaging_icon from '../../../src/features/Messaging-icon.png';
import monetisation_icon from '../../../src/features/monetisation_icon.png';
import privacy_icon_feature from '../../../src/features/privacy-icon.png';

import crewsphere from '../../../src/images/crewshpere.png';
import icp from '../../../src/images/icp_global.png';

import founder from "../../../src/images/profile_pic.png";
import Jhansi from "../../../src/images/Jhansi.jpg";
import Mukesh from "../../../src/images/Mukesh.jpeg";
import Meghana from "../../../src/images/Meghana.jpg";
import Narasimha from "../../../src/images/Narasimha.jpg";
import William from "../../../src/images/Willilam.jpeg";

import { GlobalContext } from '../../store/GlobalStore';

import { logInOutline, logoInstagram, logoLinkedin, logoX, play } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import './LandingPage.scss';
import Login from '../../components/Login/Login';
import { HttpAgent } from '@dfinity/agent';
import { createActor, socio_backend } from '../../../../declarations/socio_backend';

export default function LandingPage() {
  const [logo, setLogo] = useState(null);
  const { state } = useContext(GlobalContext);
  const { screenType, actor } = state;

  const [count, setCount] = useState(null);
  const [identity, setIdentity] = useState(null);

  let actor1 = socio_backend;

  async function localLogin() {
    let host1 = null;
    if (process.env.DFX_NETWORK === "local") {
      host1 = 'http://localhost:4943';
    } else {
      host1 = 'https://ic0.app';
    }
    const agent = new HttpAgent({ host: host1 });

    if (process.env.DFX_NETWORK !== "ic") {
      await agent.fetchRootKey();
    }

    actor1 = createActor(process.env.CANISTER_ID_SOCIO_BACKEND, {
      agent,
    });

  }

  useEffect(() => {

    localLogin();

    const fetchTheme = async () => {
      const { value } = await Preferences.get({ key: 'color-theme' });
      const theme = value || 'dark'; // Default to 'dark' if no theme is set
      document.body.setAttribute('color-theme', theme);
      setLogo(theme === 'dark' ? socio_logo_black : socio_logo_white);
    };
    fetchTheme();

    const updateUserCount = async () => {
      if(actor1 === null) return;
      const identity = await actor1.getIdentity();
      setIdentity(identity);
      const value = await actor1.getUserCount();
      setCount(Number(value));
    };
    updateUserCount();

  }, []);

  return (
    <IonPage id='LandingPage'>
      {screenType === 'mobile' ? (
        <IonMenu contentId="main-content">
          <IonContent>
            <IonList>
              <IonItem>
                <IonImg src={logo} alt='socio_logo' id='socio-logo' />
              </IonItem>
              <IonItem button href='#home' className='small-button'>Home</IonItem>
              <IonItem button href='#about' className='small-button'>About</IonItem>
              <IonItem button href='#features' className='small-button'>Features</IonItem>
              <IonItem button href='#team' className='small-button'>Team</IonItem>
            </IonList>
          </IonContent>
        </IonMenu>
      ) : null}
      <IonHeader id='NavBar'>
        <IonToolbar>
          <IonTitle>
            <IonImg src={logo} alt='socio_logo' id='socio-logo' />
          </IonTitle>
          <IonButtons slot='end'>
            {screenType === 'mobile' ? (
              <IonMenuButton />
            ) : (
              <>
                <IonButton href='#home' className='large-button'>Home</IonButton>
                <IonButton href='#about' className='large-button'>About</IonButton>
                <IonButton href='#features' className='large-button'>Features</IonButton>
                <IonButton href='#team' className='large-button'>Team</IonButton>
              </>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent id="main-content">

        <section id='home'>
          <div className="home-content">
            <div className="text-container">
              <p id="title_socio">Socio</p>
              <p className="tagline typewriter">Privacy Even While Social.</p>
              <IonButtons className="button-container">
              {
                <Login />
              }
                <button className="btn tutorial-btn" onClick={() => {
                  window.open('https://youtu.be/JrYc4Zizk68', '_blank');
                }}>
                  <IonIcon icon={play} slot="start" />
                  Tutorial
                </button>
              </IonButtons>
            </div>
            <div className="svg-container">
              <img src={social_media_illustration} alt="SVG Illustration" />
            </div>
          </div>
        </section>

        <section id='about'>
          <h2>About Us</h2>
          <div className="about-content">
            <div className="svg-container">
              <img src={about_svg} alt="About SVG" />
            </div>
            <div className="text-container">
              <p>
                Socio, powered by the ICP Blockchain, is a dynamic social media platform that prioritizes user privacy and data security. Our robust feature set includes seamless messaging, content creation, and easy content sharing. But Socio goes beyond the ordinary: we recognize that users form the heartbeat of any social platform. That’s why we’ve built an ecosystem where both users and creators are fairly monetized. Join us in shaping a community that values connections, creativity, and empowerment.
              </p>
            </div>
          </div>
        </section>

        <section id='benefits'>
          <h3 id='question'>Why social media <br /><span id='founder_span'>On Blockchain</span></h3>

          <div className="benefits-section">
            <IonList lines='none'>
              <IonItem>
                <img src={decentralized_icon} alt="Decentralized" />
                <p>Decentralized</p>
              </IonItem>
              <IonItem>
                <img src={privacy_icon} alt="Privacy" />
                <p>Privacy</p>
              </IonItem>
              <IonItem>
                <img src={security_icon} alt="Security" />
                <p>Security</p>
              </IonItem>
              <IonItem>
                <img src={transparency_icon} alt="Transparency" />
                <p>Transparency</p>
              </IonItem>
              <IonItem>
                <img src={trust_icon} alt="Trust" />
                <p>Trust</p>
              </IonItem>
            </IonList>
          </div>
        </section>

        <section id='features'>
          <h2>Features</h2>

          <IonGrid>
            <IonRow>
              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={messaging_icon} alt="Messaging" />
                  </div>
                  <div className="feature-text">
                    <h3>Messaging & Content Sharing</h3>
                    <IonList lines='none'>
                      <IonItem>
                        Seamlessly connect with friends, family, and communities through our intuitive messaging system.
                      </IonItem>
                      <IonItem>
                        Create and share content effortlessly, whether it’s a photo, video, or thought-provoking post.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>

              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={content_creator_icon} alt="Content Creation" />
                  </div>
                  <div className="feature-text">
                    <h3>Content Creation</h3>
                    <IonList lines='none'>
                      <IonItem>
                        Create and share content effortlessly, whether it’s a photo, video, or thought-provoking post.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>

              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={privacy_icon_feature} alt="Privacy & Security" />
                  </div>
                  <div className="feature-text">
                    <h3>Privacy & Security</h3>
                    <IonList lines='none'>
                      <IonItem>
                        The platform focuses on user privacy with end-to-end encryption of messages.
                      </IonItem>
                      <IonItem>
                        It also uses internet identity to avoid the usage of passwords, enhancing the security of user accounts.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>

              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={aiml_icon} alt="AI-ML Integration" />
                  </div>
                  <div className="feature-text">
                    <h3>AI-ML Integration</h3>
                    <IonList lines='none'>
                      <IonItem>
                        AI & ML are integrated to detect violent messages and cyberbullying. Users have the option to detect unethical content like violence and explicit images, which are automatically reported and blocked.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>

              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={monetisation_icon} alt="Monetisation" />
                  </div>
                  <div className="feature-text">
                    <h3>Fair Monetisation</h3>
                    <IonList lines='none'>
                      <IonItem>
                        Socio recognizes that users and creators drive the platform. We’ve designed a fair ecosystem where both thrive.
                      </IonItem>
                      <IonItem>
                        Monetize your content, engage with your audience, and earn rewards.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>

              <IonCol size="4" size-md="4" size-sm="6" size-xs="12">
                <IonCard className="feature-item">
                  <div className="feature-image">
                    <img src={file_viewing_icon} alt="Secure File Viewing" />
                  </div>
                  <div className="feature-text">
                    <h3>Secure File Viewing</h3>
                    <IonList lines='none'>
                      <IonItem>
                        By preventing direct downloads, Socio shields users from accidentally importing malicious files or harmful links.
                      </IonItem>
                      <IonItem>
                        Instantly view documents, images, and web links without cluttering local storage.
                      </IonItem>
                      <IonItem>
                        Users can confidently explore shared content without compromising their privacy.
                      </IonItem>
                    </IonList>
                  </div>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <section id='team'>
          <p id='Founder'>Meet <br /><span id='founder_span'>The Team</span></p>

          <div className={"team-section" + " " + (screenType === 'mobile' ? 'mobile' : 'desktop')}>

            <div className="team-member one">
              <img src={founder} alt="Rathan Raju" className="team-image" />
              <div className="team-text">
                <h3>Rathan Raju</h3>
                <p>Founder & CEO</p>
                <div className="team-links">
                  <a href='https://x.com/RathanRaju7' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://linkedin.com/in/rathanraju' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

            <div className="team-member two">
              <img src={Mukesh} alt="Member 2" className="team-image" />
              <div className="team-text">
                <h3>Mukeswar</h3>
                <p>Co - Founder</p>
                <div className="team-links">
                  <a href='https://x.com/mukeswar94129' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://linkedin.com/in/mukeswar-vasana-723817278/' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

            <div className="team-member three">
              <img src={Jhansi} alt="Member 3" className="team-image" />
              <div className="team-text">
                <h3>Jhansi</h3>
                <p>Co - Founder</p>
                <div className="team-links">
                  <a href='https://x.com/JNarasingu47320' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://www.linkedin.com/in/jhansi-narasingula-746360233' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

            <div className="team-member four">
              <img src={Meghana} alt="Member 4" className="team-image" />
              <div className="team-text">
                <h3>Meghana</h3>
                <p>Co - Founder</p>
                <div className="team-links">
                  <a href='https://x.com/Meghana_0304' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://www.linkedin.com/in/chinnam-meghana' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

            <div className="team-member five">
              <img src={William} alt="Member 5" className="team-image reverse-image" />
              <div className="team-text">
                <h3>William</h3>
                <p>Co - Founder</p>
                <div className="team-links">
                  <a href='https://x.com/williamchi19896' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://www.linkedin.com/in/william-chintapalli-35423b265/' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

            <div className="team-member six">

              <img src={Narasimha} alt="Member 6" className="team-image" />
              <div className="team-text">
                <h3>Narasimha</h3>
                <p>Co - Founder</p>
                <div className="team-links">
                  <a href='https://x.com/Narasimha_2003' target='_blank'>
                    <IonIcon icon={logoX} />
                  </a>
                  <a href='https://www.linkedin.com/in/challa-lakshmi-narasimha-89954b284/' target='_blank'>
                    <IonIcon icon={logoLinkedin} />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id='supporters'>
          <h2>Supported By</h2>
          <div id="supporter-logos">
            <IonImg src={crewsphere} alt='crewsphere' className='supporter-image' />
            <IonImg src={icp} alt='icp' className='supporter-image' />
          </div>
        </section>
      </IonContent>

      <IonFooter>
        <p id='footer-p'>© 2024 Socio</p>

        <div id="footer-icons">

          <p id='follow-text'>Follow us</p>

          <a href='https://x.com/Socio9819' target='_blank'>
            <IonIcon icon={logoX} />
          </a>

          <a href='https://www.instagram.com/socio9819/' target='_blank'>
            <IonIcon icon={logoInstagram} />
          </a>

          <a href='https://www.linkedin.com/company/socio9819' target='_blank'>
            <IonIcon icon={logoLinkedin} />
          </a>

        </div>

        <div id="footer-count">
          <p id='count'>Current Users: </p><span>{
            count === null ? <IonSkeletonText animated style={{ width: '20px' }} /> : count
          }
          </span>
        </div>
      </IonFooter>
    </IonPage>
  );
}