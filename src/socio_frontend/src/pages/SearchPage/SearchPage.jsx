import { useContext, useEffect, useState } from 'react';
import { IonContent, IonSearchbar, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonSpinner, IonPage } from '@ionic/react';
import { useHistory } from 'react-router';

import './SearchPage.scss';
import { GlobalContext } from '../../store/GlobalStore';
import { convertToImage } from '../../utils/image_utils/convertImage';
import { Link } from 'react-router-dom';

export default function SearchPage({ setUser, setProfileType, setSearchProfileOpen }) {

    const { state } = useContext(GlobalContext);
    const { actor, screenType, user } = state;

    const history = useHistory();

    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState([]);

    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearch = async (event) => {
        const query = event.target.value.toLowerCase();
        setSearchText(query);
        if (query) {
            setSearchLoading(true);
            let filteredResults = await actor.searchUsers(query);
            filteredResults = filteredResults.filter((result) => result[0].username !== user.username);
            setResults(filteredResults);
            setSearchLoading(false);
        } else {
            setResults([]);
        }
    };

    return (
        <IonPage id='SearchPage'>
            <IonContent>
                <div className="search-page">
                    <IonSearchbar
                        value={searchText}
                        onIonInput={handleSearch}
                        placeholder="Search users"
                    />
                    <IonList>
                        {
                            (searchText !== '' && !searchLoading) ?
                                !searchLoading ?
                                    results.map((result, index) => (
                                            <IonItem key={index} className='search-result-item' onClick={() => {
                                                setUser(result[0]);
                                                setProfileType('non-self');
                                                setSearchProfileOpen(true);
                                                history.push(`/profile/${result[0].username}`);
                                            }}>
                                                <IonAvatar slot="start">
                                                    <img src={convertToImage(result[0].profilepicture)} alt={result[0].resultname} />
                                                </IonAvatar>
                                                <IonLabel>
                                                    <h2>{result[0].username}</h2>
                                                </IonLabel>
                                            </IonItem>
                                    )) :
                                    <div className='no-searches'>
                                        <IonSpinner name="crescent" color={'primary'} />
                                        <IonLabel>Loading...</IonLabel>
                                    </div>
                                : <div className='no-searches'>
                                    No Results Found
                                </div>
                        }
                    </IonList>
                </div>
            </IonContent>
        </IonPage>
    )
}