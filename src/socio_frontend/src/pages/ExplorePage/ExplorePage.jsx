import React, { useContext, useState } from 'react';
import { IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg, IonSearchbar, IonAvatar } from '@ionic/react';
import './ExplorePage.css';
import { GlobalContext } from '../../store/GlobalStore';

const videos = [
    {
        id: 1,
        title: 'Video Title 1',
        thumbnail: 'https://via.placeholder.com/300x180',
        channel: 'Channel Name 1',
        channelAvatar: 'https://via.placeholder.com/50',
        views: '1M views',
        time: '1 day ago'
    },
    {
        id: 2,
        title: 'Video Title 2',
        thumbnail: 'https://via.placeholder.com/300x180',
        channel: 'Channel Name 2',
        channelAvatar: 'https://via.placeholder.com/50',
        views: '500K views',
        time: '2 days ago'
    },
];

export default function ExplorePage() {

    const {state} = useContext(GlobalContext);
    const {screenType} = state;

    const [searchText, setSearchText] = useState('');

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <IonPage id='ExplorePage'>
            <div className="search-container">
                <IonSearchbar
                    value={searchText}
                    onIonChange={e => setSearchText(e.detail.value)}
                    placeholder="Search"
                    className="custom-searchbar"
                />
            </div>
            <IonGrid>
                <IonRow>
                    {filteredVideos.map(video => (
                        <IonCol size="12" size-md="6" size-lg="4" key={video.id}>
                            <IonCard>
                                <IonImg src={video.thumbnail} className="video-thumbnail" />
                                <IonCardHeader className="video-info">
                                    <IonGrid className='video-info-grid'>
                                        <IonRow>
                                            <IonCol size={
                                                screenType === 'desktop' ? '2' : '3'
                                            }>
                                                <IonAvatar className="channel-avatar">
                                                    <img src={video.channelAvatar} alt={video.channel} />
                                                </IonAvatar>
                                            </IonCol>
                                            <IonCol size={
                                                screenType === 'desktop' ? '10' : '9'
                                            }>
                                                <div className="video-details">
                                                    <IonCardTitle>{video.title}</IonCardTitle>
                                                    <IonCardSubtitle>{video.channel}</IonCardSubtitle>
                                                    <IonCardSubtitle>{video.views} • {video.time}</IonCardSubtitle>
                                                </div>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>


                                </IonCardHeader>
                            </IonCard>
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>
        </IonPage>
    );
}