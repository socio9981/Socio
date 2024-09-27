import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonImg, IonIcon } from '@ionic/react';
import { folder, close } from 'ionicons/icons';
import { useState, useRef, useEffect } from 'react';
import './AttachFileModal.scss';

const AttachFileModal = ({ isOpen, onClose, onSendFile }) => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setFileType(selectedFile.type.startsWith('image') ? 'image' : 'video');
    }
  };

  const handleSendFile = () => {
    if (file) {
      onSendFile(fileUrl, file);
      setFile(null);
      setFileType(null);
      onClose();
    };
  };

  useEffect(() => {
    const handleEnterKey = (event) => {
      if (event.key === 'Enter') {
        handleSendFile();
      }
    };

    document.addEventListener('keydown', handleEnterKey);

    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, [handleSendFile]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className='attach-file-modal'>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Attach File</IonTitle>
          <IonButton slot="end" onClick={() => { onClose(); setFile(null); setFileType(null) }}>
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!file ? (
          <div className="upload-section" onClick={() => fileInputRef.current.click()}>
            <IonIcon icon={folder} className="folder-icon" />
            <p>Select File</p>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="file-preview-section">
            <div id='file-preview'>
              {fileType === 'image' ? (
                <IonImg src={fileUrl} />
              ) : (
                <video controls>
                  <source src={fileUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div id="send-button">
              <IonButton expand="block" onClick={
                () => {
                  setFile(null);
                  setFileType(null);
                }
              }>Cancel</IonButton>
              <IonButton expand="block" onClick={handleSendFile}>Send</IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default AttachFileModal;