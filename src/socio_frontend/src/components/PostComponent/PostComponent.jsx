import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../../store/GlobalStore';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonAvatar, IonLabel, IonSkeletonText } from '@ionic/react';
import { thumbsUp, thumbsUpOutline, thumbsDown, thumbsDownOutline, chatbubbleOutline, paperPlaneOutline, personAddOutline } from 'ionicons/icons';
import CommentsSection from '../CommentsSection/CommentsSection';
import './PostComponent.css';

import { convertToImage } from '../../utils/image_utils/convertImage';
import { convertToVideo } from '../../utils/image_utils/convertVideo';

export default function ({ feed }) {

    const { state } = useContext(GlobalContext);
    const { actor } = state;

    const [currentPost, setCurrentPost] = useState(null);
    const [currentMeta, setCurrentMeta] = useState(null);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        console.log(feed);
        async function fetchPost() {
            const post = await actor.getPostOrReel(feed.post);
            setCurrentMeta(post[0][0][0]);
            setCurrentPost(post[0][1][0]);
        }

        fetchPost();
    }, [feed]);

    useEffect(() => {
        console.log(currentPost);
    }, [currentPost]);

    return (
        <IonCard>
            {
                feed && currentMeta && currentPost ? (
                    <>
                        <IonCardHeader>
                            <div className="post-header">
                                <IonAvatar className="small-avatar">
                                    <img src={convertToImage(feed.profilePicture)} alt={feed.username} />
                                </IonAvatar>
                                <IonLabel className="post-user-info">
                                    <h2>{feed.username}</h2>
                                </IonLabel>
                            </div>
                        </IonCardHeader>

                        <IonCardContent>
                            {
                                currentPost.typeof === 'post' ? (
                                    <img src={convertToImage(currentPost.media)} alt={feed.username} className='post-image' />
                                ) : (
                                    <video src={convertToVideo(currentPost.media)} controls className='post-video' />
                                )
                            }
                            <p className="caption">{currentMeta.caption}</p>
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
                            {showComments && <CommentsSection comments={currentMeta.comments} />}
                        </IonCardContent>
                    </>
                ) : (
                    // Display skeleton while data is loading
                    <>
                        <IonCardHeader>
                            <div className="post-header">
                                <IonAvatar className="small-avatar">
                                    <IonSkeletonText animated style={{ width: '100%' }} />
                                </IonAvatar>
                                <IonLabel className="post-user-info">
                                    <h2>
                                        <IonSkeletonText animated style={{ width: '50%' }} />
                                    </h2>
                                </IonLabel>
                            </div>
                        </IonCardHeader>

                        <IonCardContent>
                            <IonSkeletonText animated style={{ width: '100%', height: '200px' }} className='post-image' />
                            <p className="caption">
                                <IonSkeletonText animated style={{ width: '80%' }} />
                            </p>
                            <div className="post-actions">
                                <IonSkeletonText animated style={{ width: '40px', height: '40px' }} />
                                <IonSkeletonText animated style={{ width: '40px', height: '40px' }} />
                                <IonSkeletonText animated style={{ width: '40px', height: '40px' }} />
                                <IonSkeletonText animated style={{ width: '40px', height: '40px' }} />
                            </div>
                        </IonCardContent>
                    </>
                )
            }

        </IonCard>
    );
};