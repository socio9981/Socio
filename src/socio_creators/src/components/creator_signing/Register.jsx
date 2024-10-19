import './Register.css';
import { convertToBinary } from '../../utils/image_utils/convertImage';
import content_creator from '../../images/illustrations/content_creator.jpg';
import { useState, useContext } from 'react';
import { GlobalContext } from '../../store/GlobalStore';
import { IonContent, IonGrid, IonRow, IonCol, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonPage, IonAvatar, useIonToast, useIonLoading } from '@ionic/react';

export default function Register() {

    const [presentToast] = useIonToast();
    const [present, dismiss] = useIonLoading();

    const { state, dispatch } = useContext(GlobalContext);
    const { screenType, actor } = state;

    const [username, setUsername] = useState('');
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
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,14}$/;
        const bioMaxLength = 150;

        // Validity checks
        if (!usernameRegex.test(username)) {
            presentToast({
                message: 'Username must be alphanumeric and between 3 to 15 characters.',
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

        const res = await actor.registerAsCreator(username,binaryProfilePic,bio);

        if (res === 'Register As Creator.') {
            presentToast({
                message: 'Registration Successful',
                duration: 3000,
                color: 'success',
            });

            const currentCreator = await actor.loginAsCreator();
            dispatch({ type: 'SET_CREATOR', payload: currentCreator[0] });
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
                                <img src={content_creator} />
                            </IonCol>
                        }

                        <IonCol size={
                            screenType === 'desktop' ? '6' : '12'
                        }>
                            <div id="register">Create Creator Account</div>
                            <div id="registration-form">
                                <IonItem>
                                    <IonLabel position="floating">Username</IonLabel>
                                    <IonInput value={username} onIonChange={e => setUsername(e.detail.value)} />
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