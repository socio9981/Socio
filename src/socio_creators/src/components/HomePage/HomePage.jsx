import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonSegment, IonSegmentButton, IonLabel, IonSkeletonText } from '@ionic/react';
import './HomePage.css';

export default function HomePage() {
    const [selectedButton, setSelectedButton] = useState('longs');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulate data fetching
        setLoading(true);
        setTimeout(() => {
            setData([
                { thumbnail: 'https://via.placeholder.com/150', title: 'Title 1', views: 100, likes: 10 },
                { thumbnail: 'https://via.placeholder.com/150', title: 'Title 2', views: 200, likes: 20 },
            ]);
            setLoading(false);
        }, 2000);
    }, []);

    return (
        <div id="HomePage">

            <div id="SelectionTab">

                <IonSegment value={selectedButton} onIonChange={(e) => setSelectedButton(e.detail.value)}>
                    <IonSegmentButton value={'longs'}>
                        <IonLabel>Longs</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={'shorts'}>
                        <IonLabel>Shorts</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

            </div>

            <div id="ContentSection">

                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Thumbnail</th>
                            <th>Title</th>
                            <th>Views</th>
                            <th>Likes</th>
                        </tr>
                    </thead>
                    <tbody className={loading ? '' : 'body-loaded'}>
                        {
                            loading ?
                                [1, 2, 3, 4, 5].map((index) => (
                                    <tr key={index}>
                                        <td><IonSkeletonText animated style={{height: '20px'}}/></td>
                                        <td><IonSkeletonText animated style={{height: '20px'}}/></td>
                                        <td><IonSkeletonText animated style={{height: '20px'}}/></td>
                                        <td><IonSkeletonText animated style={{height: '20px'}}/></td>
                                    </tr>
                                ))
                                :
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td><img src={item.thumbnail} alt={item.title} className="thumbnail" /></td>
                                        <td>{item.title}</td>
                                        <td>{item.views}</td>
                                        <td>{item.likes}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}