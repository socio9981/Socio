import React from 'react';
import { IonList, IonItem, IonLabel, IonAvatar } from '@ionic/react';
import './CommentsSection.css';

export default function CommentsSection({ comments }){
    return (
        <IonList className="comments-section">
            {comments.map((comment, index) => (
                <IonItem key={index}>
                    <IonAvatar slot="start">
                        <img src={comment.avatar} alt={comment.name} />
                    </IonAvatar>
                    <IonLabel>
                        <h3>{comment.name}</h3>
                        <p>{comment.text}</p>
                    </IonLabel>
                </IonItem>
            ))}
        </IonList>
    );
};