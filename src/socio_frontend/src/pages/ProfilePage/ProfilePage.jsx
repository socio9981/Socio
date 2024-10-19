import { useContext, useEffect, useState, useRef } from 'react';
import {
    IonContent,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonAvatar,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    useIonLoading,
    IonSpinner,
    useIonToast,
    IonPage
} from '@ionic/react';
import {
    grid,
    play,
    bookmark,
    pricetag,
    camera,
    heartOutline,
    heart,
    paperPlane
} from 'ionicons/icons';

import { v4 as uuidv4 } from 'uuid';

import './ProfilePage.scss';
import { GlobalContext } from '../../store/GlobalStore';
import { convertToImage } from '../../utils/image_utils/convertImage';
import { generateChatID } from '../../utils/chat_utils/chatUtils';

export default function ProfilePage({ profileUser, type }) {

    const [activeTab, setActiveTab] = useState('posts');
    const { state, dispatch } = useContext(GlobalContext);
    const { screenType, actor, user } = state;
    
    const [presentToast] = useIonToast();

    const [profilePicture, setProfilePicture] = useState(null);

    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [saved, setSaved] = useState([]);
    const [tagged, setTagged] = useState([]);

    const [postsLoading, setPostsLoading] = useState(false);
    const [reelsLoading, setReelsLoading] = useState(false);
    const [savedLoading, setSavedLoading] = useState(false);
    const [taggedLoading, setTaggedLoading] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {
        if (profileUser.length !== 0) {
            setProfilePicture(convertToImage(profileUser.profilepicture));
        }
    }, [profileUser.profilepicture]);

    useEffect(() => {
        const fetchPosts = async () => {
            setPostsLoading(true);
            const fetchedPosts = await Promise.all(profileUser.posts.map(async (postHash) => {
                return await actor.getPostOrReel(postHash);
            }));
            setPostsLoading(false);
            setPosts(fetchedPosts);
        };

        if (profileUser.posts.length !== 0) {
            fetchPosts();
        }
    }, [profileUser.posts]);

    useEffect(() => {
        const fetchReels = async () => {
            setReelsLoading(true);
            const fetchedReels = await Promise.all(profileUser.reels.map(async (reelHash) => {
                return await actor.getPostOrReel(reelHash);
            }));
            setReelsLoading(false);
            setReels(fetchedReels);
        }

        if (profileUser.reels.length !== 0) {
            fetchReels();
        }
    }, [profileUser.reels]);

    useEffect(() => {
        console.log(profileUser.posts, type);
    }, [profileUser, type]);

    useEffect(() => {
        const fetchSaved = async () => {
            setSavedLoading(true);
            const fetchedSaved = await Promise.all(profileUser.saved.map(async (savedHash) => {
                return await actor.getPostOrReel(savedHash);
            }));
            setSavedLoading(false);
            setSaved(fetchedSaved);
        }

        if (profileUser.saved && profileUser.saved.length !== 0) {
            fetchSaved();
        }
    }, [profileUser.saved]);

    useEffect(() => {
        const fetchTagged = async () => {
            setTaggedLoading(true);
            const fetchedTagged = await Promise.all(profileUser.tagged.map(async (taggedHash) => {
                return await actor.getPostOrReel(taggedHash);
            }));
            setTaggedLoading(false);
            setTagged(fetchedTagged);
        }

        if (profileUser.tagged.length !== 0) {
            fetchTagged();
        }
    }, [profileUser.tagged]);

    useEffect(() => {
        console.log("pr")
    }, []);

    async function follow() {
        setDisableButton(true);
        let chatId = generateChatID(user.username, profileUser.username);
        let res = await actor.sendFriendRequest(chatId, profileUser.username, uuidv4(), new Date().toISOString());
        if (res) {
            let newUser = {
                ...user,
                following: [...user.following, profileUser.username]
            }
            dispatch({ type: 'SET_USER', payload: newUser });
            presentToast({
                message: 'Friend request sent',
                duration: 3000,
                color: 'success'
            });
        } else {
            presentToast({
                message: 'Failed to send friend request',
                duration: 3000,
                color: 'danger'
            });
        }
        setDisableButton(false);
    };

    async function acceptRequest() {

        setDisableButton(true);
        let chatId = generateChatID(user.username, profileUser.username);
        let res = await actor.acceptFriendRequest(chatId, profileUser.username, uuidv4(), new Date().toISOString());
        if (res) {
            let newUser = {
                ...user,
                following: [...user.following, profileUser.username]
            }
            dispatch({ type: 'SET_USER', payload: newUser });
            presentToast({
                message: 'Friend request accepted',
                duration: 3000,
                color: 'success'
            });
        } else {
            presentToast({
                message: 'Failed to accept friend request',
                duration: 3000,
                color: 'danger'
            });
        };
        setDisableButton(false);
    };

    async function unfollow() {
        setDisableButton(true);
        let chatId = generateChatID(user.username, profileUser.username);
        let res = await actor.unfollow(chatId, profileUser.username);
        if (res) {
            let newUser = {
                ...user,
                following: user.following.filter((following) => following !== profileUser.username)
            }
            dispatch({ type: 'SET_USER', payload: newUser });
            presentToast({
                message: 'Unfollowed',
                duration: 3000,
                color: 'success'
            });
        } else {
            presentToast({
                message: 'Failed to unfollow',
                duration: 3000,
                color: 'danger'
            });
        }
        setDisableButton(false);
    };

    async function reactToPost(index) {
        let res = await actor.reactToPostOrReel(profileUser.posts[index], user.username);
        if (!res) {
            presentToast({
                message: 'Failed to react to post',
                duration: 3000,
                color: 'danger'
            });
        }
    };

    async function reactToReel(index) {
        let res = await actor.reactToPostOrReel(profileUser.reels[index], user.username);
        if (!res) {
            presentToast({
                message: 'Failed to react to reel',
                duration: 3000,
                color: 'danger'
            });
        }
    };

    return (
        <IonPage id='ProfilePage'>
            {
                profileUser !== null && profileUser.length !== 0 &&

                <IonContent>
                    <div>
                        {
                            screenType !== 'desktop' && profileUser &&
                            <IonGrid>
                                <IonRow>
                                    <IonCol size='4'>
                                        <IonAvatar id='profile-pic'>
                                            <img src={profilePicture} alt="Profile" />
                                        </IonAvatar>
                                    </IonCol>
                                    <IonCol size='8'>
                                        <h1>{profileUser.profileUsername}</h1>
                                        <IonRow>
                                            <IonCol>
                                                {
                                                    profileUser.posts &&
                                                <p className='profile-stat'><strong>{profileUser.posts.length}</strong> posts</p>
                                                }
                                            </IonCol>
                                            <IonCol>
                                                <p className='profile-stat'><strong>{profileUser.followers.length}</strong> followers</p>
                                            </IonCol>
                                            <IonCol>
                                                <p className='profile-stat'><strong>{profileUser.following.length}</strong> following</p>
                                            </IonCol>
                                        </IonRow>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>
                                        <p>{profileUser.bio}</p>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    {
                                        type === 'self'
                                            ? <IonCol size='6'><IonButton disabled={disableButton} expand='block'>Edit Profile</IonButton></IonCol>
                                            :
                                            user.following.includes(profileUser.username)
                                                ?
                                                <IonCol size='6'>
                                                    <IonButton disabled={disableButton} expand='block' onClick={() => {
                                                        unfollow();
                                                    }}>Unollow
                                                    </IonButton>
                                                </IonCol>
                                                : (user.followers.includes(profileUser.username) && user.following.includes(profileUser.user))
                                                    ? <IonCol size='6'>
                                                        <IonButton disabled={disableButton} expand='block' onClick={() => {
                                                            acceptRequest();
                                                        }}>
                                                            Accept
                                                        </IonButton>
                                                    </IonCol>
                                                    : <IonCol size='6'>
                                                        <IonButton disabled={disableButton} expand='block' onClick={() => {
                                                            follow();
                                                        }}>Follow
                                                        </IonButton>
                                                    </IonCol>
                                    }

                                    <IonCol size='6'><IonButton expand='block'>Settings</IonButton></IonCol>
                                </IonRow>
                            </IonGrid>
                        }

                        {
                            screenType === 'desktop' &&
                            <IonGrid>
                                <IonRow>
                                    <IonCol size='2'></IonCol>
                                    <IonCol size="2">
                                        <IonAvatar id='profile-pic'>
                                            <img src={profilePicture} alt="Profile" />
                                        </IonAvatar>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonRow>
                                            <IonCol>
                                                <h2>{profileUser.profileUsername}</h2>
                                                {
                                                    type === 'self'
                                                        ? <IonButton>Edit Profile</IonButton>
                                                        :
                                                        user.following.includes(profileUser.username) ?
                                                            <IonButton disabled={disableButton} onClick={() => {
                                                                unfollow();
                                                            }}>
                                                                Unollow
                                                            </IonButton> :
                                                            (user.followers.includes(profileUser.username) && !user.following.includes(profileUser.username)) ?
                                                                <IonButton disabled={disableButton} onClick={() => {
                                                                    acceptRequest();
                                                                }}>
                                                                    Accept
                                                                </IonButton> :
                                                                <IonButton disabled={disableButton} onClick={() => {
                                                                    follow();
                                                                }}>Follow</IonButton>
                                                }
                                                <IonButton>Settings</IonButton>
                                            </IonCol>
                                        </IonRow>
                                        <IonRow>
                                            <IonCol>
                                                <p className='profile-stat'><strong>{profileUser.posts.length}</strong> posts</p>
                                            </IonCol>
                                            <IonCol>
                                                <p className='profile-stat'><strong>{profileUser.followers.length}</strong> followers</p>
                                            </IonCol>
                                            <IonCol>
                                                <p className='profile-stat'><strong>{profileUser.following.length}</strong> following</p>
                                            </IonCol>
                                        </IonRow>
                                        <IonRow>
                                            <IonCol>
                                                <p>{profileUser.bio}</p>
                                            </IonCol>
                                        </IonRow>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                        }

                        <IonSegment className="tabs" value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value)}>
                            <IonSegmentButton value="posts">
                                <IonLabel>
                                    <IonIcon icon={grid} />
                                    Posts
                                </IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="reels">
                                <IonLabel>
                                    <IonIcon icon={play} />
                                    Reels
                                </IonLabel>
                            </IonSegmentButton>
                            {
                                type === 'self' &&
                                <IonSegmentButton value="saved">
                                    <IonLabel>
                                        <IonIcon icon={bookmark} />
                                        Saved
                                    </IonLabel>
                                </IonSegmentButton>
                            }
                            <IonSegmentButton value="tagged">
                                <IonLabel>
                                    <IonIcon icon={pricetag} />
                                    Tagged
                                </IonLabel>
                            </IonSegmentButton>
                        </IonSegment>

                        <div className="tab-content">
                            {activeTab === 'posts' &&
                                (
                                    profileUser.posts.length !== 0 ?
                                        <IonGrid>
                                            <IonRow>
                                                {
                                                    postsLoading ?
                                                        <div className='no-content spinner'>
                                                            <IonSpinner name="crescent" color={'primary'} />
                                                            <IonLabel>Loading posts...</IonLabel>
                                                        </div>
                                                        :
                                                        posts.map((post, index) => {
                                                            let postData = post[0][0][0];
                                                            let postMedia = post[0][1][0];
                                                            return <IonCol size="4" key={index} className='content-item' onClick={() => {
                                                                alert("post clicked")
                                                            }}>
                                                                <img src={convertToImage(postMedia.media)} alt="post" className="grid-image" />
                                                                <div className='content-overlay'>
                                                                    <span onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        reactToPost(index);
                                                                        if (!postData.likes.includes(user.username)) {
                                                                            postData.likes.push(user.username);
                                                                        } else {
                                                                            postData.likes = postData.likes.filter((like) => like !== user.username);
                                                                        }
                                                                        setPosts([...posts]);
                                                                    }}>
                                                                        <IonIcon icon={
                                                                            postData.likes.includes(user.username) ? heart : heartOutline
                                                                        } /> {postData.likes.length}
                                                                    </span>
                                                                    <span>
                                                                        <IonIcon icon={paperPlane} />
                                                                    </span>
                                                                </div>
                                                            </IonCol>
                                                        })
                                                }
                                            </IonRow>
                                        </IonGrid>
                                        : <div className='no-content'>
                                            <IonIcon icon={camera} />
                                            <p>No posts yet</p>
                                        </div>
                                )
                            }
                            {activeTab === 'reels' &&
                                (
                                    profileUser.reels.length !== 0 ?
                                        <IonGrid>
                                            <IonRow>
                                                {
                                                    reelsLoading ?
                                                        <div className='no-content spinner'>
                                                            <IonSpinner name="crescent" color={'primary'} />
                                                            <IonLabel>Loading reels...</IonLabel>
                                                        </div>
                                                        :
                                                        reels.map((reel, index) => {
                                                            let reelMedia = reel[0][1][0];
                                                            let reelData = reel[0][0][0];
                                                            return <IonCol size="4" key={index} className='content-item' onClick={() => {
                                                                alert("reel clicked")
                                                            }}>
                                                                <img src={convertToImage(reelMedia.media)} alt="reel" className="grid-image" />
                                                                <div className='content-overlay'>
                                                                    <span>
                                                                        <IonIcon icon={
                                                                            reelData.likes.includes(user.username) ? heart : heartOutline
                                                                        } onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            reactToReel(index);
                                                                            if (!reelData.likes.includes(user.username)) {
                                                                                reelData.likes.push(user.username);
                                                                            } else {
                                                                                reelData.likes = reelData.likes.filter((like) => like !== user.username);
                                                                            }
                                                                            setReels([...reels]);
                                                                        }} /> {reelData.likes.length}
                                                                    </span>
                                                                </div>
                                                            </IonCol>
                                                        })
                                                }
                                            </IonRow>
                                        </IonGrid>
                                        : <div className='no-content'>
                                            <IonIcon icon={camera} />
                                            <p>No reels yet</p>
                                        </div>
                                )
                            }
                            {activeTab === 'saved' &&
                                (
                                    profileUser.saved.length !== 0 ?
                                        <IonGrid>
                                            <IonRow>
                                                {
                                                    savedLoading ?
                                                        <div className='no-content spinner'>
                                                            <IonSpinner name="crescent" color={'primary'} />
                                                            <IonLabel>Loading saved posts...</IonLabel>
                                                        </div>
                                                        :
                                                        saved.map((saved, index) => {
                                                            let savedMedia = saved[0][1][0];
                                                            return <IonCol size="4" key={index}>
                                                                <img src={convertToImage(savedMedia.media)} alt="saved" className="grid-image" />
                                                            </IonCol>
                                                        })
                                                }
                                            </IonRow>
                                        </IonGrid>
                                        : <div className='no-content'>
                                            <IonIcon icon={camera} />
                                            <p>No saved posts yet</p>
                                        </div>
                                )
                            }
                            {activeTab === 'tagged' &&
                                (
                                    profileUser.tagged.length !== 0 ?
                                        <IonGrid>
                                            <IonRow>
                                                {
                                                    taggedLoading ?
                                                        <div className='no-content spinner'>
                                                            <IonSpinner name="crescent" color={'primary'} />
                                                            <IonLabel>Loading tagged posts...</IonLabel>
                                                        </div>
                                                        :
                                                        tagged.map((tagged, index) => {
                                                            let taggedMedia = tagged[0][1][0];
                                                            return <IonCol size="4" key={index}>
                                                                <img src={convertToImage(taggedMedia.media)} alt="tagged" className="grid-image" />
                                                            </IonCol>
                                                        })
                                                }
                                            </IonRow>
                                        </IonGrid>
                                        : <div className='no-content'>
                                            <IonIcon icon={camera} />
                                            <p>No tagged posts yet</p>
                                        </div>
                                )
                            }
                        </div>

                    </div>
                </IonContent>
            }
        </IonPage>
    )
}