// eslint-disable-next-line no-unused-vars
import React, {useContext, useEffect, useState} from 'react';
import './Create.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage, faMultiply} from "@fortawesome/free-solid-svg-icons";
import {GlobalStore} from "../../store/GlobalStore.jsx";
import useConvertToBinary from "../../hooks/useConverToBinary.js";
import {v4 as uuidv4} from 'uuid';
import {ja} from "faker/lib/locales.js";

// eslint-disable-next-line react/prop-types
export default function Create ({ isOpen, onClose, setLoading }){

    const {setAlert,actor,setUserDetails} = useContext(GlobalStore);
    const {binary, convertToBinary} = useConvertToBinary();

    const [file, setFile] = useState(null);
    const [binaryFile, setBinaryFile] = useState(null);
    const [caption, setCaption] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        convertToBinary(e.target.files[0]);
    };

    const handleCaptionChange = (e) => {
        setCaption(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(binaryFile && caption){
            setLoading("Uploading...");
            const fileId = uuidv4();
            const uploadDate = new Date();
            let submitRes = await actor.setPost(fileId, binaryFile, caption, uploadDate.toISOString());
            setLoading(null);

            if(submitRes["ok"]){
                setAlert({message: submitRes["ok"], type: "success"});
                setUserDetails(previousDetails => ({
                    ...previousDetails,
                    postsCount: previousDetails.postsCount + BigInt(1),
                    posts: [...previousDetails.posts,fileId]
                }))
                onClose();
                setCaption('');
                setFile(null);
            } else if(submitRes["err"]){
                setAlert({message: submitRes["err"], type: "error"});
                onClose();
                setCaption('');
                setFile(null);
            } else{
                setAlert({message: "An error occurred. Please try again.", type: "error"});
                onClose();
                setCaption('');
                setFile(null);
            }
        }
    };

    useEffect(() => {
        if(binary !== null){
            setBinaryFile(binary);
        }
    }, [binary]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="upload-modal">
                <button className="close-button" onClick={onClose}>{<FontAwesomeIcon icon={faMultiply} />}</button>
                <form onSubmit={handleSubmit}>
                    {
                        !file && (
                            <div className="file-picker">
                                <FontAwesomeIcon icon={faImage}/>
                                <label htmlFor={"file-upload"}>
                                    <div>
                                        Upload a file
                                    </div>
                                </label>
                                <input id={"file-upload"} type="file" onChange={handleFileChange}/>
                            </div>
                        )
                    }

                    {
                        file &&
                        (
                            <div className="file-preview">
                                <div id="file-preview-container">
                                    <img src={URL.createObjectURL(file)} alt="Preview"/>
                                </div>

                                <div id="file-actions">
                                    <textarea id={"caption"} placeholder="Caption" value={caption}
                                           onChange={handleCaptionChange} maxLength={300}/>
                                    <button id={"create"} type="submit">Upload</button>
                                </div>
                            </div>
                        )
                    }
                </form>
        </div>
    );
};