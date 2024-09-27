import { IonItem, IonAvatar, IonLabel, IonContent, IonList, IonButton, IonThumbnail, IonIcon, IonSpinner, useIonToast } from '@ionic/react';
import { personAddOutline, send } from 'ionicons/icons';

import './NotificationsPage.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../store/GlobalStore';
import { generateChatID } from '../../utils/chat_utils/chatUtils';

import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router';
import { convertToImage } from '../../utils/image_utils/convertImage';

export default function NotificationsPage({ setUser, setProfileType, setSearchProfileOpen }) {

    const { state } = useContext(GlobalContext);
    const { actor, user } = state;

    const history = useHistory();

    const [notifications, setNotifications] = useState(null);
    const [finalNotifications, setFinalNotifications] = useState([]);

    const [notificationsLoading, setNotificationsLoading] = useState(false);

    const [presentToast] = useIonToast();

    useEffect(() => {
        async function fetchNotifications() {
            setNotificationsLoading(true);
            return await actor.getNotifications();
        };
        fetchNotifications().then((notifications) => {
            if (notifications.length !== 0) {
                setNotifications(notifications);
            }
            setNotificationsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (notifications !== null && notifications.length > 0) {
            setNotificationsLoading(true);
            const fetchNotifications = async () => {
                let finalNotifications = [];
                for (let index = 0; index < notifications[0].notifications.length; index++) {
                    const notification = notifications[0].notifications[index];
                    const sender = await actor.getUserByUsername(notification.sender);
                    const tempNotification = {
                        ...notification,
                        user: sender[0]
                    };
                    finalNotifications.push(tempNotification);
                }
                setFinalNotifications(finalNotifications);
                setNotificationsLoading(false);
            };
            fetchNotifications();
        }
    }, [notifications]);

    const renderNotification = (notificationItem) => {

        let notification = notificationItem;
        switch (notification.typeof) {
            case 'sent_request':
                return (
                    <IonItem key={notification.id} onClick={() => {
                        setUser(notification.user);
                        setProfileType('non-self');
                        setSearchProfileOpen(true);
                        history.push(`/profile/${notification.sender}`);
                    }}>
                        <IonAvatar slot="start">
                            <img src={convertToImage(notification.user.profilepicture)} alt={notification.sender} />
                        </IonAvatar>
                        <IonLabel>
                            <h2>{notification.sender}</h2>
                            <p>started following you</p>
                        </IonLabel>
                    </IonItem>
                );
            case 'accepted_request':
                return (
                    <IonItem key={notification.id} onClick={() => {
                        setUser(notification.user);
                        setProfileType('no-self');
                        setSearchProfileOpen(true);
                        history.push(`/profile/${notification.sender}`);
                    }}>
                        <IonAvatar slot='start'>
                            <img src={convertToImage(notification.user.profilepicture)} alt={notification.sender} />
                        </IonAvatar>
                        <IonLabel>
                            <h2>{notification.sender}</h2>
                            <p>accepted your request</p>
                        </IonLabel>
                    </IonItem>
                );
            case 'like':
                return (
                    <IonItem key={notification.id}>
                        <IonAvatar slot="start">
                            <img src={notification.avatar} alt={notification.username} />
                        </IonAvatar>
                        <IonLabel>
                            <h2>{notification.username}</h2>
                            <p>liked your post</p>
                        </IonLabel>
                        <IonThumbnail slot="end">
                            <img src={notification.postThumbnail} alt="Post Thumbnail" className='thumbnail' />
                        </IonThumbnail>
                    </IonItem>
                );
            case 'dislike':
                return (
                    <IonItem key={notification.id}>
                        <IonAvatar slot="start">
                            <img src={notification.avatar} alt={notification.username} />
                        </IonAvatar>
                        <IonLabel>
                            <h2>{notification.username}</h2>
                            <p>disliked your post</p>
                        </IonLabel>
                        <IonThumbnail slot="end">
                            <img src={notification.postThumbnail} alt="Post Thumbnail" className='thumbnail' />
                        </IonThumbnail>
                    </IonItem>
                );
            default:
                return null;
        }
    };

    return (
        <div id='NotificationsPage'>
            <IonContent>
                <div className="notifications-page">
                    <h1>Notifications</h1>
                    <IonList>
                        {
                            notifications !== null ?
                                notificationsLoading ?
                                    <div className='no-notifications'>
                                        <IonSpinner name="crescent" color={'primary'} />
                                        <IonLabel>Loading Notifications...</IonLabel>
                                    </div>
                                    :
                                    finalNotifications.map((notification) => renderNotification(notification))
                                : <div className='no-notifications'>
                                    <IonLabel>No Notifications</IonLabel>
                                </div>
                        }
                    </IonList>
                </div>
            </IonContent>
        </div>
    )
}