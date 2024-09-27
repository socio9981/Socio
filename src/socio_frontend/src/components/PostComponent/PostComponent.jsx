import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonAvatar, IonLabel } from '@ionic/react';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, chatbubbleOutline, paperPlaneOutline, personAddOutline } from 'ionicons/icons';
import CommentsSection from '../CommentsSection/CommentsSection';
import './PostComponent.css';

export default function({ post }){
    const [showComments, setShowComments] = useState(false);

    return (
        <IonCard>
            <IonCardHeader>
                <div className="post-header">
                    <IonAvatar className="small-avatar">
                        <img src={post.avatar} alt={post.name} />
                    </IonAvatar>
                    <IonLabel className="post-user-info">
                        <h2>{post.name}</h2>
                    </IonLabel>
                    <IonButton fill="outline" size="small">
                        <IonIcon icon={personAddOutline} slot="start" />
                        Follow
                    </IonButton>
                </div>
            </IonCardHeader>
            <IonCardContent>
                <img src={post.image} alt={post.title} className='post-image' />
                <p className="caption">{post.caption}</p>
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
                {showComments && <CommentsSection comments={post.comments} />}
            </IonCardContent>
        </IonCard>
    );
};