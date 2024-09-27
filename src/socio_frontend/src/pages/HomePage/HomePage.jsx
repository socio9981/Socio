import React, { useContext } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import PostComponent from '../../components/PostComponent/PostComponent';
import VideoComponent from '../../components/VideoComponent/VideoComponent';
import './HomePage.scss';
import { GlobalContext } from '../../store/GlobalStore';

export default function HomePage() {

    const { state } = useContext(GlobalContext);
    const { screenType } = state;

    const posts = Array.from({ length: 5 }).map((_, index) => ({
        title: `Post ${index + 1}`,
        image: `https://picsum.photos/150?random=${index + 100}`,
        avatar: `https://picsum.photos/150?random=${index + 1}`,
        name: `User ${index + 1}`,
        caption: `This is the caption for post ${index + 1}`,
        comments: Array.from({ length: 3 }).map((_, idx) => ({
            avatar: `https://via.placeholder.com/150?text=Commenter+${idx + 1}`,
            name: `Commenter ${idx + 1}`,
            text: `This is comment ${idx + 1}`
        }))
    }));

    const videos = Array.from({ length: 5 }).map((_, index) => ({
        title: `Video ${index + 1}`,
        src: `https://www.w3schools.com/html/mov_bbb.mp4`,
        avatar: `https://via.placeholder.com/150?text=User+${index + 1}`,
        name: `User ${index + 1}`,
        caption: `This is the caption for video ${index + 1}`,
        comments: Array.from({ length: 3 }).map((_, idx) => ({
            avatar: `https://via.placeholder.com/150?text=Commenter+${idx + 1}`,
            name: `Commenter ${idx + 1}`,
            text: `This is comment ${idx + 1}`
        }))
    }));

    return (
        <IonPage>
            <IonContent>
                <div id='HomePage'>
                    <div className="left-section">
                        {/* Stories Section */}
                        <div className="stories-section">
                            <div id='stories-list'>
                                <div className="story-item my-story">
                                    <IonAvatar>
                                        <img src="https://picsum.photos/seed/85/150" alt="Your Story" />
                                    </IonAvatar>
                                    <IonLabel>Add Story</IonLabel>
                                    <IonIcon icon={addCircleOutline} id='add-story' />
                                </div>
                                {Array.from({ length: 20 }).map((_, index) => (
                                    <div key={index} className="story-item">
                                        <IonAvatar>
                                            {/* <img src={`https://via.placeholder.com/150?text=Story+${index + 1}`} alt={`Story ${index + 1}`} /> */}
                                            <img src={`https://picsum.photos/seed/${index}/150`} alt='img' />
                                        </IonAvatar>
                                        <IonLabel>Story {index + 1}</IonLabel>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feed Section */}
                        <div className="feed-section">
                            <IonList>
                                {posts.map((post, index) => (
                                    <PostComponent key={index} post={post} />
                                ))}
                                {videos.map((video, index) => (
                                    <VideoComponent key={index} video={video} />
                                ))}
                            </IonList>
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    {screenType === 'desktop' &&
                        <div className="right-section">
                            <IonList>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <IonItem key={index}>
                                        <IonAvatar slot="start">
                                            <img src={`https://picsum.photos/seed/${80 +index}/150`} alt={`User ${index + 1}`} />
                                        </IonAvatar>
                                        <IonLabel>
                                            <h2>User {index + 1}</h2>
                                            <p>Suggested for you</p>
                                        </IonLabel>
                                    </IonItem>
                                ))}
                            </IonList>
                        </div>
                    }
                </div>
            </IonContent>
        </IonPage>
    );
}