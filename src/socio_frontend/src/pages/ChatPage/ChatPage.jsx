import { useContext, useEffect, useState, useRef } from 'react';

import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonAvatar,
    IonBackButton,
    IonContent,
    IonFooter,
    IonInput,
    IonSpinner,
    IonSkeletonText
} from '@ionic/react';

import {
    pencilSharp,
    callOutline,
    videocamOutline,
    attachOutline,
    sendOutline,
    chatbubbleOutline
} from 'ionicons/icons';

import './ChatPage.scss';
import { GlobalContext } from '../../store/GlobalStore';
import { convertToBinary, convertToImage } from '../../utils/image_utils/convertImage';
import AttachFileModal from '../../components/AttachFileModal/AttachFileModal';

export default function ChatPage() {

    const { state } = useContext(GlobalContext);
    const { actor, user } = state;

    const [chats, setChats] = useState([]);
    const [chatsLoading, setChatsLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState('individual');
    const [selectedChat, setSelectedChat] = useState(null);

    const [messagesLoading, setMessagesLoading] = useState(false);
    const [message, setMessage] = useState('');

    const messagesEndRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            setChatsLoading(true);
            let chats = await Promise.all(user.chatids.map(async (chatId, index) => {
                let chatName = chatId.split(':').find((name) => name !== user.username);
                let profilePic = await actor.getUserProfilePic(chatName);
                let lastMessagePreview = await actor.lastMessage(chatName);
                let lastMessage = lastMessagePreview !== null ? lastMessagePreview : null;

                return {
                    id: index,
                    chatId: chatId,
                    name: chatName,
                    profilePic: profilePic[0],
                    lastMessage: lastMessage
                };
            }));
            setChats(chats);
            setChatsLoading(false);
        };

        fetchChats();
    }, [user.chatids]);

    useEffect(() => {
        if (selectedChat !== null && selectedChat.messages && selectedChat.messages.length > 0)
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    async function selectChat(id, name, profilePic, chatId) {
        if (selectedChat === null || selectedChat.chatId !== chatId) {
            setSelectedChat({
                id: id,
                name: name,
                profilePic: profilePic,
                isActive: true,
                messages: [],
                chatId: chatId
            });
            setMessagesLoading(true);
            let fetched_messages = await actor.getMessages(chatId);

            setMessagesLoading(false);
            setSelectedChat(prevState => ({
                ...prevState,
                messages: fetched_messages[0]
            }));
        }
    };

    async function handleSendMessage() {
        if (message !== '') {
            let chatId = selectedChat.chatId;
            let sender = user.username;
            let message_to_be_sent = message;

            setMessage('');
            let res = await actor.sendMessage(chatId, sender, message_to_be_sent, new Date().toISOString(), [], "null");

            if (res) {
                setSelectedChat(prevState => ({
                    ...prevState,
                    messages: [
                        ...(prevState?.messages || []),
                        {
                            sender: user.username,
                            message: message_to_be_sent,
                            media: null,
                            mediaType: null,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }));
            } else {
                alert('Message sent');
            }
        }
    }
    const handleAttach = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleSendFile = async (fileUrl, file) => {
        if (fileUrl && file) {
            let chatId = selectedChat.chatId;
            let sender = user.username;
            let message_to_be_sent = "";
            let binaryFile = await convertToBinary(file);

            let res = actor.sendMessage(chatId, sender, message_to_be_sent, new Date().toISOString(), [binaryFile], file.type);
            if (res) {
                setSelectedChat(prevState => ({
                    ...prevState,
                    messages: [...prevState.messages, {
                        sender: user.username,
                        message: message_to_be_sent,
                        media: [binaryFile],
                        mediaType: file.type,
                        timestamp: new Date().toISOString()
                    }]
                }))
            }
            else {
                alert('Message sent');
            }
        }
    };

    useEffect(() => {
        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                if (!isModalOpen) {
                    handleSendMessage();
                };
            }
        };

        document.addEventListener('keydown', handleEnterKey);

        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [isModalOpen, handleSendMessage, handleSendFile]);

    return (
        <div id='ChatPage'>
            <div id="chat-list" className={selectedChat === null ? 'open' : 'close'}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Chats</IonTitle>
                        <IonButtons slot="end">
                            <IonButton>
                                <IonIcon icon={pencilSharp} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonSearchbar
                    value={searchText}
                    onIonChange={e => setSearchText(e.detail.value)}
                    placeholder="Search"
                    className='search-bar'
                />

                <IonSegment value={selectedType} onIonChange={e => setSelectedType(e.detail.value)}>
                    <IonSegmentButton value="individual">
                        <IonLabel>Individual</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="group">
                        <IonLabel>Group</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="random">
                        <IonLabel>Random</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <IonList className="chat-list">
                    {
                        !chatsLoading ?
                            chats.length !== 0 ?
                                chats.map((chat) => (

                                    <IonItem key={chat.id} button onClick={() => selectChat(chat.id, chat.name, chat.profilePic, chat.chatId)}>
                                        <IonAvatar slot="start">
                                            <img src={convertToImage(chat.profilePic)} alt={chat.name} />
                                        </IonAvatar>
                                        <IonLabel>
                                            <h2>{chat.name}</h2>
                                            <p className="message-preview">{chat.lastMessage}</p>
                                        </IonLabel>
                                        <p className="message-time">{chat.lastMessage.timestamp}</p>
                                    </IonItem>
                                ))
                                : <div className='no-chats-list'>
                                    <p>No chats </p>
                                </div>
                            :
                            [...Array(20)].map((_, index) => (
                                <IonItem key={index}>
                                    <IonAvatar slot="start">
                                        <IonSkeletonText animated />
                                    </IonAvatar>

                                    <IonLabel>
                                        <h2><IonSkeletonText animated style={{ width: '70%' }} /></h2>
                                        <p className="message-preview"><IonSkeletonText animated style={{ width: '50%' }} /></p>
                                    </IonLabel>
                                    <p className="message-time"><IonSkeletonText animated /></p>
                                </IonItem>
                            ))
                    }
                </IonList>
            </div>

            <div id="chat-container" className={selectedChat === null ? 'close' : 'open'}>
                {
                    selectedChat !== null ?
                        <>
                            <IonHeader className='chat-header'>
                                <IonBackButton defaultHref='' onClick={() => setSelectedChat(null)} />
                                <IonToolbar>
                                    <IonAvatar slot="start">
                                        <img src={convertToImage(selectedChat.profilePic)} alt={selectedChat.name} id='selected-chat-avatar' />
                                    </IonAvatar>
                                    <IonLabel>
                                        <h2>{selectedChat.name}</h2>
                                        <p>{selectedChat.isActive ? 'Active now' : 'Offline'}</p>
                                    </IonLabel>
                                    <IonButtons slot="end">
                                        <IonButton>
                                            <IonIcon icon={callOutline} />
                                        </IonButton>
                                        <IonButton>
                                            <IonIcon icon={videocamOutline} />
                                        </IonButton>
                                    </IonButtons>
                                </IonToolbar>
                            </IonHeader>

                            <div className={`messages-section ${messagesLoading ? '' : 'messages-loaded'}`}>
                                {
                                    !messagesLoading ? (
                                        <>
                                            {selectedChat.messages &&
                                                selectedChat.messages.map((msg, index) => (
                                                    <div key={index} className={`message ${msg.sender === user.username ? 'sent' : 'received'}`}>
                                                        {msg.message !== "" && <p>{msg.message}</p>}
                                                        {
                                                            msg.media !== null &&
                                                            msg.mediaType !== 'null' && (msg.mediaType === 'image/png' ? <img src={convertToImage(msg.media[0])} alt="media" /> : <video controls src={msg.src} />)
                                                        }
                                                    </div>
                                                ))}
                                            <div ref={messagesEndRef}></div>
                                        </>
                                    ) : (
                                        [...Array(20)].map((_, index) => (
                                            <div key={index} className={`message ${index % 2 === 0 ? 'sent' : 'received'}`}>
                                                <IonSkeletonText animated style={{ width: '100%' }} />
                                            </div>
                                        ))
                                    )
                                }
                            </div>

                            <IonFooter className='chat-footer'>
                                <IonToolbar>
                                    <IonButton slot="start" onClick={handleAttach}>
                                        <IonIcon icon={attachOutline} />
                                    </IonButton>
                                    <AttachFileModal isOpen={isModalOpen} onClose={() => {
                                        setIsModalOpen(false);
                                    }
                                    } onSendFile={handleSendFile} />
                                    <IonInput
                                        value={message}
                                        placeholder="Type a message"
                                        onIonChange={e => setMessage(e.detail.value)}
                                    />
                                    <IonButton slot="end" onClick={() => handleSendMessage()}>
                                        <IonIcon icon={sendOutline} />
                                    </IonButton>
                                </IonToolbar>
                            </IonFooter>
                        </>
                        :
                        <div className='no-chat-content'>
                            <IonIcon icon={chatbubbleOutline} />
                            <IonLabel >Select a chat</IonLabel>
                        </div>
                }

            </div>
        </div>
    )
}