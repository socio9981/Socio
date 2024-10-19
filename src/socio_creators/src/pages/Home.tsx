import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { BrowserRouter as Router } from 'react-router-dom';
import './Home.css';
import Sidebar from '../components/Sidebar/Sidebar';
import Mainsection from '../components/Mainsection/Mainsection';

const Home: React.FC = () => {
  return (
    <IonPage id='Home'>
      <Router>
      <IonContent fullscreen>

        <div id='Home-container'>
          <Sidebar />

          <Mainsection />
        </div>
        
      </IonContent>
      </Router>
    </IonPage>
  );
};

export default Home;