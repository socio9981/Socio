import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonAvatar, IonLabel } from '@ionic/react';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, chatbubbleOutline, paperPlaneOutline, personAddOutline } from 'ionicons/icons';
import CommentsSection from '../CommentsSection/CommentsSection';
import './VideoComponent.css';

export default function({ video }){
    const [showComments, setShowComments] = useState(false);

    return (
        <IonCard>
            <IonCardHeader>
                <div className="post-header">
                    <IonAvatar className="small-avatar">
                        <img src={video.avatar} alt={video.name} />
                    </IonAvatar>
                    <IonLabel className="post-user-info">
                        <h2>{video.name}</h2>
                    </IonLabel>
                    <IonButton fill="outline" size="small">
                        <IonIcon icon={personAddOutline} slot="start" />
                        Follow
                    </IonButton>
                </div>
            </IonCardHeader>
            <IonCardContent>
                <video controls>
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <p className="caption">{video.caption}</p>
                <div className="post-actions">
                    <IonButton fill="clear">
                        <IonIcon icon={thumbsUp} />
                    </IonButton>
                    <IonButton fill="clear">
                        <IonIcon icon={thumbsDown} />
                     </IonButton>
                    <IonButton fill="clear" onClick={() => setShowComments(!showComments)}>
                        <IonIcon icon={chatbubbleOutline} />
                    </IonButton>
                    <IonButton fill="clear">
                        <IonIcon icon={paperPlaneOutline} />
                    </IonButton>
                </div>
                {showComments && <CommentsSection comments={video.comments} />}
            </IonCardContent>
        </IonCard>
    );
};