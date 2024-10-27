import React, { useState, useContext } from 'react';
import { IonModal, IonButton, IonTextarea, IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, useIonToast, useIonLoading } from '@ionic/react';
import { convertToBinary, convertToHash } from '../../utils/image_utils/convertImage';
import { convertVideoToBinary, convertVideoToHash } from '../../utils/image_utils/convertVideo';
import './CreateComponent.css';
import { GlobalContext } from '../../store/GlobalStore';

export default function CreateComponent({ isOpen, onClose }) {

    const { state, dispatch } = useContext(GlobalContext);
    const { actor, user } = state;

    const [presentToast] = useIonToast();
    const [present, dismiss] = useIonLoading();

    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [preview, setPreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const fileType = selectedFile.type.split('/')[0];
            setIsVideo(fileType === 'video');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
            setIsVideo(false);
        }
    };

    const handleCaptionChange = (event) => {
        setCaption(event.target.value);
    };

    const handleSubmit = async () => {
        await present({ message: "Uploading..." });
        if (file === null || caption === null || caption === '') {
            presentToast({
                message: "Please select a file and add a caption",
                duration: 3000,
                color: "danger"
            });
            dismiss();
            return;
        }
        let res = null;
        let currentHash = null;
        let currentFileType = null;
        if (!isVideo) {
            const media = await convertToBinary(file);
            const fileHash = await convertToHash(media);
            currentHash = fileHash;
            currentFileType = file.type;
            res = await actor.uploadPost(fileHash, media, user.ispublic, caption, new Date().toISOString());
        } else {
            const media = await convertVideoToBinary(file);
            const fileHash = await convertVideoToHash(media);
            currentHash = fileHash;
            currentFileType = file.type;
            res = await actor.uploadReel(fileHash, media, user.ispublic, caption, new Date().toISOString());
        }
        if (res) {
            presentToast({
                message: "Media Uploaded successfully",
                duration: 3000,
                color: "success"
            });
            if (!isVideo) {
                let currentPosts = user.posts;
                currentPosts.push(currentHash);
                dispatch({
                    type: 'SET_USER', payload: {
                        ...user,
                        posts: currentPosts
                    }
                });
            }
            else {
                let currentReels = user.reels;
                currentReels.push(currentHash);
                dispatch({
                    type: 'SET_USER', payload: {
                        ...user,
                        reels: currentReels
                    }
                })
            }
        } else {
            presentToast({
                message: "Failed to Upload post",
                duration: 3000,
                color: "danger"
            });
        }
        onClose();
        setCaption('');
        setFile(null);
        setPreview(null);
        setIsVideo(false);
        dismiss();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} id='create-component'>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Create Post</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="create-post-container">
                    {preview ? (
                        <div className="preview-container">
                            {isVideo ? (
                                <video controls className="preview-media-video">
                                    <source src={preview} type={file.type} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img src={preview} alt="Preview" className="preview-media-image" />
                            )}
                        </div>
                    ) : (
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
                    )}
                    <IonTextarea
                        placeholder="Write a caption..."
                        value={caption}
                        onIonChange={handleCaptionChange}
                    />
                </div>
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    <IonButton expand="block" onClick={handleSubmit}>Post</IonButton>
                    <IonButton expand="block" onClick={() => {
                        onClose();
                        setCaption('');
                        setFile(null);
                        setPreview(null);
                        setIsVideo(false);
                    }}>Cancel</IonButton>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
}