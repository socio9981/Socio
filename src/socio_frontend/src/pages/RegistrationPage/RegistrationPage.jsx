import React, { useContext, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonGrid, IonRow, IonCol, IonAvatar, useIonToast, useIonLoading } from '@ionic/react';
import socio_logo_main from '../../images/main_logo_with_tagline.png';
import './RegistrationPage.scss';
import { GlobalContext } from '../../store/GlobalStore';

import { convertToBinary } from '../../utils/image_utils/convertImage';

export default function RegistrationPage() {

    const [presentToast] = useIonToast();
    const [present, dismiss] = useIonLoading();

    const { state, dispatch } = useContext(GlobalContext);
    const { screenType, actor } = state;

    const [username, setUsername] = useState('');
    const [displayname, setDisplayname] = useState('');
    const [bio, setBio] = useState('');
    const [profielFile, setProfileFlie] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFlie(file);
            setProfilePicture(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        await present({
            message: "Registering...",
        });
        let binaryProfilePic = null;
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,14}$/; // 3 to 15 characters
        const displaynameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/; // 3 to 30 characters
        const bioMaxLength = 150;

        // Validity checks
        if (!usernameRegex.test(username)) {
            presentToast({
                message: 'Username accepts 3 to 15 characters/numbers and must start with a letter.',
                duration: 3000,
                color: 'warning',
            });
            dismiss();
            return;
        }

        if (!displaynameRegex.test(displayname)) {
            presentToast({
                message: 'Display name accepts 3 to 30 characters/numbers and must start with a letter.',
                duration: 3000,
                color: 'warning',
            });
            dismiss();
            return;
        }

        if (bio.length > bioMaxLength) {
            presentToast({
                message: `Bio must be less than ${bioMaxLength} characters.`,
                duration: 3000,
                color: 'warning',
            });
            dismiss();
            return;
        }

        if (profilePicture) {
            binaryProfilePic = await convertToBinary(profielFile);
        }

        if (!binaryProfilePic) {
            presentToast({
                message: 'Please upload a profile picture.',
                duration: 3000,
                color: 'warning',
            });
            dismiss();
            return;
        };

        const res = await actor.registerUser(username, displayname, bio, binaryProfilePic);

        if (res === 'true') {
            presentToast({
                message: 'Registration Successful',
                duration: 3000,
                color: 'success',
            });

            const currentUser = await actor.getUser();
            dispatch({ type: 'SET_USER', payload: currentUser[0] });
        } else if (res === 'false') {
            presentToast({
                message: 'Username already exists',
                duration: 3000,
                color: 'danger',
            });
        } else if (res === 'Username Taken') {
            presentToast({
                message: 'Username already taken',
                duration: 3000,
                color: 'warning',
            });
        }
        else {
            console.log(res);
        }
        dismiss();

    };

    return (
        <IonPage id="RegistrationPage">
            <IonContent>
                <IonGrid>
                    <IonRow>
                        {
                            screenType === 'desktop' &&
                            <IonCol size='6'>
                                <img src={socio_logo_main} />
                            </IonCol>
                        }

                        <IonCol size={
                            screenType === 'desktop' ? '6' : '12'
                        }>
                            <div id="register">Create Your Account</div>
                            <div id="registration-form">
                                <IonItem>
                                    <IonLabel position="floating">Username</IonLabel>
                                    <IonInput value={username} onIonChange={e => setUsername(e.detail.value)} />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">Display Name</IonLabel>
                                    <IonInput value={displayname} onIonChange={e => setDisplayname(e.detail.value)} />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">Bio</IonLabel>
                                    <IonTextarea value={bio} onIonChange={e => setBio(e.detail.value)} />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Profile Picture</IonLabel>
                                    <label className="custom-file-upload">
                                        <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
                                        Choose File
                                    </label>
                                </IonItem>
                                {profilePicture && (
                                    <IonAvatar>
                                        <img src={profilePicture} alt="Profile" />
                                    </IonAvatar>
                                )}
                                <IonButton expand="block" onClick={handleSubmit}>Register</IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
}