import React, { useContext, useEffect, useState } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonLoading } from '@ionic/react';
import { addCircleOutline, personAdd } from 'ionicons/icons';
import PostComponent from '../../components/PostComponent/PostComponent';
import VideoComponent from '../../components/VideoComponent/VideoComponent';
import './HomePage.scss';
import { GlobalContext } from '../../store/GlobalStore';

export default function HomePage() {

    const { state } = useContext(GlobalContext);
    const { screenType, actor, user } = state;
    const [following, setFollowing] = useState(null);
    const [followingPosts, setFollowingPosts] = useState({});
    const [followingProfilesVideos, setFollowingProfilesVideos] = useState({});
    const [followingProfiles, setFollowingProfiles] = useState({});
    const [feed, setFeed] = useState([]);

    // Set following list when the user changes
    useEffect(() => {
        if (user) {
            setFollowing(user.following);
        }
    }, [user]);

    useEffect(() => {
        console.log(feed);
    }, [feed]);

    // Fetch following users' profiles and pictures
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await Promise.all(
                    following.map(async (name) => {
                        return await actor.getUserByUsername(name);
                    })
                );
                return fetchedUsers;
            } catch (error) {
                console.error('Error fetching users:', error);
                return [];
            }
        };

        const updateFollowingData = (users) => {
            const newProfiles = {};
            const newProfilesVideos = {};
            const newPics = {};

            users.forEach((user) => {
                newProfiles[user[0].username] = user[0].posts;
                newProfilesVideos[user[0].username] = user[0].reels;
                newPics[user[0].username] = user[0].profilepicture;
            });

            setFollowingProfiles((prev) => ({ ...prev, ...newProfiles }));
            setFollowingProfilesVideos((prev) => ({ ...prev, ...newProfilesVideos }));
            setFollowingPosts((prev) => ({ ...prev, ...newPics }));
        };

        if (following && following.length > 0) {
            fetchUsers().then(updateFollowingData);
        }
    }, [following, actor]);

    useEffect(() => {
        const generateRandomPostArray = () => {
            const randomPostArray = [];

            const updatedFollowingProfiles = { ...followingProfiles }; // Copy the followingProfiles to modify it

            // Keep selecting random posts until all posts are exhausted
            while (Object.keys(updatedFollowingProfiles).length > 0) {
                const profileKeys = Object.keys(updatedFollowingProfiles);

                if (profileKeys.length === 0) break; // If there are no more profiles left, break the loop

                // Select a random key (username)
                const randomKey = profileKeys[Math.floor(Math.random() * profileKeys.length)];
                const randomPosts = updatedFollowingProfiles[randomKey];

                // If the selected key has posts, pick a random post
                if (randomPosts && randomPosts.length > 0) {
                    const randomPostIndex = Math.floor(Math.random() * randomPosts.length);
                    const randomPost = randomPosts[randomPostIndex];

                    // Get the profile picture corresponding to the key
                    const profilePic = followingPosts[randomKey];

                    // Create an object with post content, profile pic, and username and add it to the array
                    randomPostArray.push({
                        username: randomKey,
                        post: randomPost,
                        profilePicture: profilePic
                    });

                    // Remove the selected post from the original array
                    randomPosts.splice(randomPostIndex, 1); // Remove the selected post

                    // If the user has no more posts, remove the user from updatedFollowingProfiles
                    if (randomPosts.length === 0) {
                        delete updatedFollowingProfiles[randomKey];
                    }
                } else {
                    // If the user has no posts left, remove the user from updatedFollowingProfiles
                    delete updatedFollowingProfiles[randomKey];
                }
            }

            setFeed(randomPostArray); // Update the state with the new random posts array
        };

        generateRandomPostArray();

        const generateRandomVideoArray = () => {
            const randomVideoArray = [];

            const updatedFollowingProfilesVideos = { ...followingProfilesVideos }; // Copy the followingProfilesVideos to modify it

            // Keep selecting random posts until all posts are exhausted
            while (Object.keys(updatedFollowingProfilesVideos).length > 0) {
                const profileKeys = Object.keys(updatedFollowingProfilesVideos);

                if (profileKeys.length === 0) break; // If there are no more profiles left, break the loop

                // Select a random key (username)
                const randomKey = profileKeys[Math.floor(Math.random() * profileKeys.length)];
                const randomVideos = updatedFollowingProfilesVideos[randomKey];

                // If the selected key has posts, pick a random post
                if (randomVideos && randomVideos.length > 0) {
                    const randomVideoIndex = Math.floor(Math.random() * randomVideos.length);
                    const randomVideo = randomVideos[randomVideoIndex];

                    // Get the profile picture corresponding to the key
                    const profilePic = followingPosts[randomKey];

                    // Create an object with post content, profile pic, and username and add it to the array
                    randomVideoArray.push({
                        username: randomKey,
                        post: randomVideo,
                        profilePicture: profilePic
                    });

                    // Remove the selected post from the original array
                    randomVideos.splice(randomVideoIndex, 1); // Remove the selected post

                    // If the user has no more posts, remove the user from updatedFollowingProfiles
                    if (randomVideos.length === 0) {
                        delete updatedFollowingProfilesVideos[randomKey];
                    }
                } else {
                    // If the user has no posts left, remove the user from updatedFollowingProfiles
                    delete updatedFollowingProfilesVideos[randomKey];
                }
            }

            setFeed((prev) => [...prev, ...randomVideoArray]); // Update the state with the new random posts array
        }

        generateRandomVideoArray();

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Swap elements
            }
            return array;
        }

        setFeed((prev) => shuffleArray(prev));

    }, [followingProfiles, followingPosts]);

    return (
        <IonPage>
            <IonContent>
                <div id='HomePage'>
                    <div className="left-section">
                        {/* Stories Section */}
                        <div className="stories-section">
                            <div id='stories-list'>
                                <div className="story-item my-story">
                                    <IonAvatar>
                                        <img src="https://picsum.photos/seed/85/150" alt="Your Story" />
                                    </IonAvatar>
                                    <IonLabel>Add Story</IonLabel>
                                    <IonIcon icon={addCircleOutline} id='add-story' />
                                </div>
                                {Array.from({ length: 20 }).map((_, index) => (
                                    <div key={index} className="story-item">
                                        <IonAvatar>
                                            <img src={`https://picsum.photos/seed/${index}/150`} alt='img' />
                                        </IonAvatar>
                                        <IonLabel>Story {index + 1}</IonLabel>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feed Section */}
                        <div className="feed-section">
                            <IonList>
                                {
                                    feed.length > 0 ?
                                        feed.map((feed, index) => (
                                            <PostComponent key={index} feed={feed} />
                                        )) :
                                        <div id="no-feed">
                                            <IonIcon icon={personAdd} />
                                            <p>Start following users to see their posts</p>
                                        </div>
                                }
                                {/* {videos.map((video, index) => (
                                    <VideoComponent key={index} video={video} />
                                ))} */}
                            </IonList>

                        </div>
                    </div>

                    {/* Suggestions Section */}
                    {screenType === 'desktop' &&
                        <div className="right-section">
                            <IonList>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <IonItem key={index}>
                                        <IonAvatar slot="start">
                                            <img src={`https://picsum.photos/seed/${80 + index}/150`} alt={`User ${index + 1}`} />
                                        </IonAvatar>
                                        <IonLabel>
                                            <h2>User {index + 1}</h2>
                                            <p>Suggested for you</p>
                                        </IonLabel>
                                    </IonItem>
                                ))}
                            </IonList>
                        </div>
                    }
                </div>
            </IonContent>
        </IonPage>
    );
}