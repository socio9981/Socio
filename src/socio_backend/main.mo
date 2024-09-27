/**
 * This file contains the implementation of the main actor in the SOCIO backend.
 * It defines the User, Media and Notifications types, as well as the data structures and functions
 * related to managing users,media and notifications.
 */

import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

import socio_media "canister:socio_media";
import socio_chats "canister:socio_chats";

actor {

  /**
   * Type definitions starts
   */

  /**
   * Represents a user in the SOCIO platform.
   */

  type User = {
    ispublic : Bool;
    username : Text;
    displayname : Text;
    bio : Text;
    profilepicture : Blob;
    followers : [Text];
    following : [Text];
    friendrequests : [Text];
    posts : [Text];
    reels : [Text];
    tagged : [Text];
    saved : [Text];
    chatids : [Text];
  };

  /**
   * Represents a media in the SOCIO platform.
   */
  type Media = {
    typeof : Text;
    media : Blob;
    owner : Principal;
    ispublic : Bool;
  };

  /**
   * Represents a comment on a media object.
   */
  type Comment = {
    id : Text;
    username : Text;
    comment : Text;
    likes : [Text];
  };

  /**
   * Represents the data associated with a media object.
   */
  type MediaData = {
    likes : [Text];
    comments : [Comment];
    caption : Text;
    date : Text;
  };

  /**
   * Represents a notification in the SOCIO platform.
   */
  type Notification = {
    id : Text;
    sender : Text;
    typeof : Text;
    read : Bool;
    media : Text;
    date : Text;
  };

  /**
   * Represents a collection of notifications.
   */
  type Notifications = {
    notifications : [Notification];
  };

  /**
     * Represents a message in a chat.
     */
  type Message = {
    sender : Text;
    message : Text;
    timestamp : Text;
    media : ?Blob;
    mediaType : Text;
  };

  /**
     * Represents a chat, which is an array of messages.
     */
  type Chat = [Message];

  /**
   * Type definitions ends
   */

  /**
   * storage starts
   */

  // HashMap to store users with their corresponding principal as the key
  private var users : HashMap.HashMap<Principal, User> = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);

  // Array to store users that need to be upgraded
  private stable var upgradeUsers : [(Principal, User)] = [];

  // A private variable that stores user mappings as key-value pairs
  // The key is of type Text and the value is of type Principal
  private var usermappings : HashMap.HashMap<Text, Principal> = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);

  // A stable variable that stores user mappings to be upgraded
  // Each element in the array is a tuple of type (Text, Principal)
  private stable var upgradeUserMappings : [(Text, Principal)] = [];

  // This private stable variable stores a list of usernames.
  private stable var usernames : [Text] = [];

  // HashMap to store notifications for each user with their corresponding principal as the key
  private var notifications : HashMap.HashMap<Principal, Notifications> = HashMap.HashMap<Principal, Notifications>(10, Principal.equal, Principal.hash);

  // Array to store notifications that need to be upgraded
  private stable var upgradeNotifications : [(Principal, Notifications)] = [];

  // HashMap to store media data with their corresponding hash as the key
  private var mediadata : HashMap.HashMap<Text, MediaData> = HashMap.HashMap<Text, MediaData>(10, Text.equal, Text.hash);

  // Array to store media data that need to be upgraded
  private stable var upgradeMediaData : [(Text, MediaData)] = [];

  /**
   * storage ends
   */

  /**
   * System functions starts
   */

  /**
   * Function called before an upgrade to capture the current state of users, user mappings and notifications
   */
  system func preupgrade() {
    upgradeUsers := Iter.toArray(users.entries());
    upgradeUserMappings := Iter.toArray(usermappings.entries());
    upgradeNotifications := Iter.toArray(notifications.entries());
    upgradeMediaData := Iter.toArray(mediadata.entries());
  };

  /**
   * Function called after an upgrade to restore the state of users, user mappings and notifications
   */
  system func postupgrade() {
    users := HashMap.fromIter<Principal, User>(upgradeUsers.vals(), 10, Principal.equal, Principal.hash);
    upgradeUsers := [];

    usermappings := HashMap.fromIter<Text, Principal>(upgradeUserMappings.vals(), 10, Text.equal, Text.hash);
    upgradeUserMappings := [];

    notifications := HashMap.fromIter<Principal, Notifications>(upgradeNotifications.vals(), 10, Principal.equal, Principal.hash);
    upgradeNotifications := [];

    mediadata := HashMap.fromIter<Text, MediaData>(upgradeMediaData.vals(), 10, Text.equal, Text.hash);
    upgradeMediaData := [];
  };

  /**
   * System functions ends
   */

  /**
    * Custom functions starts
    */

  // Function: registerUser
  // Description: Registers a new user with the provided information.
  // Parameters:
  // - username: The username of the user.
  // - displayname: The display name of the user.
  // - bio: The bio of the user.
  // - profilepicture: The profile picture of the user.
  // Returns: A boolean indicating whether the user registration was successful.
  public shared (msg) func registerUser(username : Text, displayname : Text, bio : Text, profilepicture : Blob) : async Text {

    if (usermappings.get(username) != null) {
      return "Username Taken";
    };

    let caller = msg.caller;

    let newUser = {
      ispublic = true;
      username = username;
      displayname = displayname;
      bio = bio;
      profilepicture = profilepicture;
      followers = [];
      following = [];
      friendrequests = [];
      posts = [];
      reels = [];
      tagged = [];
      saved = [];
      chatids = [];
    };

    let user = users.get(caller);
    if (user != null) {
      return "false";
    };

    let _ = usermappings.put(username, caller);
    let _ = users.put(caller, newUser);
    usernames := Array.append(usernames, [username]);
    return "true";

  };

  public func getUsernames() : async [Text] {
    return usernames;
  };

  // Retrieves the user associated with the caller of the function.
  // Returns the user if found, otherwise returns null.
  public shared (msg) func getUser() : async ?User {

    let caller = msg.caller;

    let user = users.get(caller);

    if (user == null) {
      return null;
    };

    return user;

  };

  /**
   * Retrieves user information by username.
   *
   * @param username - The username of the user to retrieve information for.
   * @returns The user information(private or public) if found, otherwise null.
   */
  public func getUserByUsername(userName : Text) : async ?{
    username : Text;
    isPublic : Bool;
    displayname : Text;
    bio : Text;
    profilepicture : Blob;
    followers : [Text];
    following : [Text];
    posts : [Text];
    reels : [Text];
    tagged : [Text];
  } {
    let user_principal = usermappings.get(userName);
    if (user_principal == null) {
      return null;
    };
    let user = switch (user_principal) {
      case (null) { null };
      case (?principal) { users.get(principal) };
    };
    switch (user) {
      case (null) { return null };
      case (?user) {
        let username = userName;
        let isPublic = user.ispublic;
        let displayname = user.displayname;
        let bio = user.bio;
        let profilepicture = user.profilepicture;
        let followers = if (isPublic) user.followers else [];
        let following = if (isPublic) user.following else [];
        let posts = if (isPublic) user.posts else [];
        let reels = if (isPublic) user.reels else [];
        let tagged = if (isPublic) user.tagged else [];
        return ?{
          username;
          isPublic;
          displayname;
          bio;
          profilepicture;
          followers;
          following;
          posts;
          reels;
          tagged;
        };
      };
    };
  };

  /// Retrieves the profile picture of a user based on their username.
  ///
  /// This function looks up the user's principal using the provided username,
  /// then retrieves the user's profile information and returns their profile picture.
  ///
  /// # Arguments
  ///
  /// - `username` (`Text`): The username of the user whose profile picture is to be retrieved.
  ///
  /// # Returns
  ///
  /// - `async ?Blob`: An optional `Blob` containing the user's profile picture.
  ///   - Returns `null` if the username does not exist or if the user does not have a profile picture.
  public func getUserProfilePic(username : Text) : async ?Blob {
    let user_principal = usermappings.get(username);
    if (user_principal == null) {
      return null;
    };
    let user = switch (user_principal) {
      case (null) { null };
      case (?principal) { users.get(principal) };
    };
    switch (user) {
      case (null) { return null };
      case (?user) {
        return ?user.profilepicture;
      };
    };
  };

  // Function to edit the user's profile.
  // Parameters:
  // - isPublic: A boolean indicating whether the user's profile is public or not.
  // - username: The new username for the user.
  // - displayname: The new display name for the user.
  // - bio: The new bio for the user.
  // - profilepicture: The new profile picture for the user.
  // Returns:
  // - A boolean indicating whether the profile was successfully edited or not.
  public shared (msg) func editProfile(isPublic : Bool, username : Text, displayname : Text, bio : Text, profilepicture : Blob) : async Bool {

    let caller = msg.caller;

    let user = users.get(caller);

    switch (user) {
      case (null) { return false };
      case (?user) {
        let editedUser = {
          ispublic = isPublic;
          username = username;
          displayname = displayname;
          bio = bio;
          profilepicture = profilepicture;
          followers = user.followers;
          following = user.following;
          friendrequests = user.friendrequests;
          posts = user.posts;
          reels = user.reels;
          tagged = user.tagged;
          saved = user.saved;
          chatids = user.chatids;
        };

        if (user.username != username) {
          let _ = usermappings.put(username, caller);
          let _ = usermappings.delete(user.username);
          let newArray = Array.append(usernames, [username]);
          let finalArray = Array.filter<Text>(newArray, func(name) { name != user.username });
          usernames := finalArray;
        };
        let _ = users.put(caller, editedUser);

      };
    };

    return true;

  };

  /**
   * Searches for users based on a given search term.
   *
   * @param searchTerm The search term to match against usernames.
   * @returns An array of matched users, each containing the following properties:
   *   - isPublic: A boolean indicating if the user's profile is public.
   *   - displayname: The display name of the user.
   *   - bio: The bio of the user.
   *   - profilepicture: The profile picture of the user.
   *   - followers: A list of usernames of users who follow this user.
   *   - following: A list of usernames of users whom this user follows.
   *   - posts: A list of post IDs created by this user.
   *   - reels: A list of reel IDs created by this user.
   */
  public func searchUsers(searchTerm : Text) : async [
    ?{
      username : Text;
      isPublic : Bool;
      displayname : Text;
      bio : Text;
      profilepicture : Blob;
      followers : [Text];
      following : [Text];
      posts : [Text];
      reels : [Text];
      tagged : [Text];
    }
  ] {
    let matchedUsers = Array.filter<Text>(
      usernames,
      func(name : Text) : Bool {
        Text.contains(name, #text searchTerm);
      },
    );

    var matchedUserDetails : [
      ?{
        username : Text;
        isPublic : Bool;
        displayname : Text;
        bio : Text;
        profilepicture : Blob;
        followers : [Text];
        following : [Text];
        posts : [Text];
        reels : [Text];
        tagged : [Text];
      }
    ] = [];

    for (user in Array.vals(matchedUsers)) {
      let userDetails = await getUserByUsername(user);
      matchedUserDetails := Array.append(matchedUserDetails, [userDetails]);
    };
    return matchedUserDetails;
  };

  // Adds a notification for a given principal.
  //
  // Arguments:
  // - principal: The principal for which the notification is being added.
  // - notification: The notification to be added.
  //
  // Returns:
  // - true if the notification was successfully added, false otherwise.
  public func addNotification(principal : Principal, notification : Notification) : async Bool {
    let currentNotifications = notifications.get(principal);
    switch (currentNotifications) {
      case (null) {
        notifications.put(principal, { notifications = [notification] });
      };
      case (?ns) {
        let newNotifications = Array.append<Notification>(ns.notifications, [notification]);
        notifications.put(principal, { notifications = newNotifications });
      };
    };
    return true;
  };

  // Retrieves the notifications for the caller.
  //
  // Returns:
  // - The notifications for the caller, or null if no notifications are found.
  public shared (msg) func getNotifications() : async ?Notifications {
    let caller = msg.caller;
    return notifications.get(caller);
  };

  /**
   * Marks a notification as read for a given principal.
   *
   * @param principal - The principal for whom the notification is being marked as read.
   * @param notificationId - The ID of the notification to be marked as read.
   * @returns A boolean indicating whether the notification was successfully marked as read.
   */
  public func markNotificationAsRead(principal : Principal, notificationId : Text) : async Bool {
    let currentNotifications = notifications.get(principal);
    switch (currentNotifications) {
      case (null) {
        return false; // No notifications for this principal
      };
      case (?ns) {
        let updatedNotifications = Array.map<Notification, Notification>(
          ns.notifications,
          func(n : Notification) : Notification {
            if (n.id == notificationId) {
              return {
                id = n.id;
                sender = n.sender;
                typeof = n.typeof;
                read = true;
                media = n.media;
                date = n.date;
              };
            } else {
              return n;
            };
          },
        );
        notifications.put(principal, { notifications = updatedNotifications });
        return true;
      };
    };
  };

  /**
   * Sends a friend request to a user
   *
   * @param chatId - The ID of the chat.
   * @param username - The username of the user to send the friend request to.
   * @returns A text indicating the result of the operation.
   *          - If the friend request is successfully sent, it returns true, and sends notification
   *          - If there is an unexpected error, it returns false
   */
  public shared (msg) func sendFriendRequest(chatId : Text, username : Text, id : Text, date : Text) : async Bool {
    let caller = msg.caller;
    let me = users.get(caller);
    var myUsername = "";
    let friendPrincipal = usermappings.get(username);
    var friendAdded = false;

    switch (me) {
      case (null) { return false };
      case (?me) {
        let newMe = {
          ispublic = me.ispublic;
          username = me.username;
          displayname = me.displayname;
          bio = me.bio;
          profilepicture = me.profilepicture;
          followers = me.followers;
          following = Array.append<Text>(me.following, [username]);
          friendrequests = me.friendrequests;
          posts = me.posts;
          reels = me.reels;
          tagged = me.tagged;
          saved = me.saved;
          chatids = Array.append<Text>(me.chatids, [chatId]);
        };
        myUsername := me.username;
        let _ = users.put(caller, newMe);
        friendAdded := true;
      };
    };

    if (friendAdded == true) {
      switch (friendPrincipal) {
        case (null) { return false };
        case (?principal) {
          let friend = users.get(principal);
          switch (friend) {
            case (null) { return false };
            case (?friend) {
              let newFriend = {
                ispublic = friend.ispublic;
                username = friend.username;
                displayname = friend.displayname;
                bio = friend.bio;
                profilepicture = friend.profilepicture;
                followers = Array.append<Text>(friend.followers, [myUsername]);
                following = friend.following;
                friendrequests = Array.append<Text>(friend.friendrequests, [myUsername]);
                posts = friend.posts;
                reels = friend.reels;
                tagged = friend.tagged;
                saved = friend.saved;
                chatids = friend.chatids;
              };
              let _ = users.put(principal, newFriend);
              let _ = await addNotification(
                principal,
                {
                  id = id;
                  sender = myUsername;
                  typeof = "sent_request";
                  read = false;
                  media = "";
                  date = date;
                },
              );
              return true;
            };
          };
        };
      };
    };
    return false;
  };

  /**
   * Accepts a friend request from a user
   *
   * @param chatId - The ID of the chat.
   * @param username - The username of the user who sent the friend request.
   * @returns A text indicating the result of the operation.
   *          - If the friend request is successfully accepted, it returns true, and sends notification
   *          - If there is an unexpected error, it returns false
   */
  public shared (msg) func acceptFriendRequest(chatId : Text, username : Text, id : Text, date : Text) : async Bool {
    let caller = msg.caller;
    let me = users.get(caller);
    let friendPrincipal = usermappings.get(username);
    var myUsername = "";
    var accepted = false;

    switch (me) {
      case (null) { return false };
      case (?me) {
        let newMe = {
          ispublic = me.ispublic;
          username = me.username;
          displayname = me.displayname;
          bio = me.bio;
          profilepicture = me.profilepicture;
          followers = me.followers;
          following = Array.append<Text>(me.following, [username]);
          friendrequests = Array.filter<Text>(
            me.friendrequests,
            func(user) {
              return user != username;
            },
          );
          posts = me.posts;
          reels = me.reels;
          tagged = me.tagged;
          saved = me.saved;
          chatids = Array.append<Text>(me.chatids, [chatId]);
        };
        myUsername := me.username;
        let _ = users.put(caller, newMe);
        accepted := true;
      };
    };

    if (accepted == true) {
      switch (friendPrincipal) {
        case (null) { return false };
        case (?principal) {
          let friend = users.get(principal);
          switch (friend) {
            case (null) { return false };
            case (?friend) {
              let newFriend = {
                ispublic = friend.ispublic;
                username = friend.username;
                displayname = friend.displayname;
                bio = friend.bio;
                profilepicture = friend.profilepicture;
                followers = Array.append<Text>(friend.followers, [myUsername]);
                following = friend.following;
                friendrequests = friend.friendrequests;
                posts = friend.posts;
                reels = friend.reels;
                tagged = friend.tagged;
                saved = friend.saved;
                chatids = friend.chatids;
              };
              let _ = users.put(principal, newFriend);
              let _ = await addNotification(
                principal,
                {
                  id = id;
                  sender = myUsername;
                  typeof = "accepted_request";
                  read = false;
                  media = "";
                  date = date;
                },
              );
              return true;
            };
          };
        };
      };
    };
    return false;
  };

  /**
   * Unfollows a user.
   *
   * @param username - The username of the user to unfollow.
   * @returns A boolean indicating whether the unfollow operation was successful.
   */
  public shared (msg) func unfollow(chatId : Text, username : Text) : async Bool {
    let caller = msg.caller;
    let me = users.get(caller);
    var myUsername = "";
    let friendPrincipal = usermappings.get(username);
    var unfollowed = false;

    switch (me) {
      case (null) { return false };
      case (?me) {
        let newMe = {
          ispublic = me.ispublic;
          username = me.username;
          displayname = me.displayname;
          bio = me.bio;
          profilepicture = me.profilepicture;
          followers = me.followers;
          following = Array.filter<Text>(
            me.following,
            func(user) {
              user != username;
            },
          );
          friendrequests = me.friendrequests;
          posts = me.posts;
          reels = me.reels;
          tagged = me.tagged;
          saved = me.saved;
          chatids = Array.filter<Text>(
            me.chatids,
            func(chat) {
              chat != chatId;
            },
          );
        };
        myUsername := me.username;
        let _ = users.put(caller, newMe);
        unfollowed := true;
      };
    };

    if (unfollowed == true) {
      switch (friendPrincipal) {
        case (null) { return false };
        case (?principal) {
          let friend = users.get(principal);
          switch (friend) {
            case (null) { return false };
            case (?friend) {
              let newFriend = {
                ispublic = friend.ispublic;
                username = friend.username;
                displayname = friend.displayname;
                bio = friend.bio;
                profilepicture = friend.profilepicture;
                followers = Array.filter<Text>(
                  friend.followers,
                  func(user) {
                    user != myUsername;
                  },
                );
                following = friend.following;
                friendrequests = friend.friendrequests;
                posts = friend.posts;
                reels = friend.reels;
                tagged = friend.tagged;
                saved = friend.saved;
                chatids = friend.chatids;
              };
              let _ = users.put(principal, newFriend);
            };
          };
        };
      };
      return true;
    };
    return false;

  };

  // Adds media to the system.
  //
  // This function adds media to the system by storing the media content along with its metadata.
  // The media can be either public or private, based on the `ispublic` parameter.
  //
  // Parameters:
  // - `hash`: The hash of the media.
  // - `mediaType`: The type of the media.
  // - `mediaContent`: The content of the media.
  // - `ispublic`: A boolean indicating whether the media is public or private.
  //
  // Returns:
  // - A boolean indicating whether the media was successfully added.
  public func addMedia(hash : Text, mediaType : Text, mediaContent : Blob, ispublic : Bool, caller : Principal) : async Bool {
    let result = await socio_media.addMedia(hash, mediaType, mediaContent, ispublic, caller);
    return result;
  };

  // Retrieves media from the system.
  //
  // This function retrieves media from the system based on the provided hash.
  //
  // Parameters:
  // - `hash`: The hash of the media to retrieve.
  //
  // Returns:
  // - An optional `Media` object representing the retrieved media, or `null` if the media was not found.
  public func getMedia(hash : Text, caller : Principal) : async ?Media {
    let result = await socio_media.getMedia(hash, caller);
    return result;
  };

  /**
   * Uploads a post with the specified hash, media content, and privacy setting.
   * @param hash - The hash of the post.
   * @param mediaContent - The content of the post.
   * @param isPublic - A boolean indicating whether the post is public or not.
   * @returns A boolean indicating whether the upload was successful or not.
   */
  public shared (msg) func uploadPost(hash : Text, mediaContent : Blob, isPublic : Bool, caption : Text, date : Text) : async Bool {
    let caller = msg.caller;
    let result = await addMedia(hash, "post", mediaContent, isPublic, caller);
    let _ = mediadata.put(
      hash,
      {
        likes = [];
        comments = [];
        caption = caption;
        date = date;
      },
    );
    let user = users.get(caller);
    switch (user) {
      case (null) { return false };
      case (?user) {
        let newMe = {
          ispublic = user.ispublic;
          username = user.username;
          displayname = user.displayname;
          bio = user.bio;
          profilepicture = user.profilepicture;
          followers = user.followers;
          following = user.following;
          friendrequests = user.friendrequests;
          posts = Array.append<Text>(user.posts, [hash]);
          reels = user.reels;
          tagged = user.tagged;
          saved = user.saved;
          chatids = user.chatids;
        };
        let _ = users.put(caller, newMe);
      };
    };
    return result;
  };

  /**
   * Uploads a reel with the specified hash, media content, and privacy setting.
   * @param hash - The hash of the reel.
   * @param mediaContent - The content of the reel.
   * @param isPublic - A boolean indicating whether the reel is public or not.
   * @returns A boolean indicating whether the upload was successful or not.
   */
  public shared (msg) func uploadReel(hash : Text, mediaContent : Blob, isPublic : Bool, caption : Text, date : Text) : async Bool {
    let caller = msg.caller;
    let result = await addMedia(hash, "reel", mediaContent, isPublic, caller);
    let _ = mediadata.put(
      hash,
      {
        likes = [];
        comments = [];
        caption = caption;
        date = date;
      },
    );
    let user = users.get(caller);
    switch (user) {
      case (null) { return false };
      case (?user) {
        let newMe = {
          ispublic = user.ispublic;
          username = user.username;
          displayname = user.displayname;
          bio = user.bio;
          profilepicture = user.profilepicture;
          followers = user.followers;
          following = user.following;
          friendrequests = user.friendrequests;
          posts = user.posts;
          reels = Array.append<Text>(user.reels, [hash]);
          tagged = user.tagged;
          saved = user.saved;
          chatids = user.chatids;
        };
        let _ = users.put(caller, newMe);
      };
    };
    return result;
  };

  /**
   * Retrieves a post OR reel with the specified hash.
   * @param hash - The hash of the post.
   * @returns An optional Media object representing the post, or null if the post is not found.
   */
  public shared (msg) func getPostOrReel(hash : Text) : async [(?MediaData, ?Media)] {
    let caller = msg.caller;
    let mediaData = mediadata.get(hash);
    let media = await getMedia(hash, caller);
    return [(mediaData, media)];
  };

  // This function allows a user to react to a post or reel by liking or unliking it.
  // It takes in the hash of the media and the username of the user.
  // Returns a boolean indicating whether the reaction was successful or not.
  public func reactToPostOrReel(hash : Text, username : Text) : async Bool {
    let mediaData = mediadata.get(hash);
    switch (mediaData) {
      case (null) { return false };
      case (?data) {
        let newLikes = if (Array.find<Text>(data.likes, func(userName) { userName == username }) == null) {
          Array.append<Text>(data.likes, [username]);
        } else {
          Array.filter<Text>(data.likes, func(userName) { userName != username });
        };
        let _ = mediadata.put(
          hash,
          {
            likes = newLikes;
            comments = data.comments;
            caption = data.caption;
            date = data.date;
          },
        );
        return true;
      };
    };
  };

  // This function allows a user to comment on a post or reel.
  // It takes in the hash of the media, the username of the commenter, and the comment text.
  // It returns a boolean indicating whether the comment was successfully added.
  public func commentOnPostOrReel(hash : Text, username : Text, comment : Text, commentId : Text) : async Bool {
    let mediaData = mediadata.get(hash);
    switch (mediaData) {
      case (null) { return false };
      case (?data) {
        let newComments = Array.append<Comment>(data.comments, [{ id = commentId; username = username; comment = comment; likes = [] }]);
        let _ = mediadata.put(
          hash,
          {
            likes = data.likes;
            comments = newComments;
            caption = data.caption;
            date = data.date;
          },
        );
        return true;
      };
    };
  };

  // This function reacts to a comment on a media item.
  // It updates the likes of the comment based on the provided username.
  // It returns true if the comment was successfully reacted to, false otherwise.
  public func reactOnComment(hash : Text, commentId : Text, username : Text) : async Bool {
    let mediaData = mediadata.get(hash);
    switch (mediaData) {
      case (null) { return false };
      case (?data) {
        var currentComment = Array.find(
          data.comments,
          func(comment : Comment) : Bool {
            return comment.id == commentId;
          },
        );
        var newComment : {
          id : Text;
          username : Text;
          comment : Text;
          likes : [Text];
        } = {
          id = "";
          username = "";
          comment = "";
          likes = [];
        };
        switch (currentComment) {
          case (null) { return false };
          case (?comment) {
            var currentLikes = comment.likes;
            let newLikes = if (Array.find<Text>(currentLikes, func(userName) { userName == username }) == null) {
              Array.append<Text>(currentLikes, [username]);
            } else {
              Array.filter<Text>(currentLikes, func(userName) { userName != username });
            };
            newComment := {
              id = comment.id;
              username = comment.username;
              comment = comment.comment;
              likes = newLikes;
            };
          };
        };
        let finalCurrentComment = Array.map<Comment, Comment>(
          data.comments,
          func(comment : Comment) : Comment {
            if (comment.id == commentId) {
              return {
                id = newComment.id;
                username = newComment.username;
                comment = newComment.comment;
                likes = newComment.likes;
              };
            } else {
              return comment;
            };
          },
        );
        let _ = mediadata.put(
          hash,
          {
            likes = data.likes;
            comments = finalCurrentComment;
            caption = data.caption;
            date = data.date;
          },
        );
        return true;
      };
    };
  };

  /**
   * Retrieves the messages of a chat identified by the given chatId.
   *
   * @param chatId The ID of the chat.
   * @returns The chat object containing the messages, or null if the caller does not have permission to access the chat.
   */
  public shared (msg) func getMessages(chatId : Text) : async ?Chat {
    let caller = msg.caller;
    let users = Iter.toArray(Text.split(chatId, #char ':'));
    var hadPermission = false;
    for (element in users.vals()) {

      if (hadPermission == false) {
        let userPrincipal = usermappings.get(element);
        switch (userPrincipal) {
          case (null) { return null };
          case (?principal) {
            if (principal == caller) {
              hadPermission := true;
            };
          };
        };
      };
    };
    if (hadPermission == false) {
      return null;
    };
    return await socio_chats.getMessages(chatId);
  };

  /**
   * Retrieves the last message in a chat based on the provided chat ID.
   *
   * @param chatId - The ID of the chat.
   * @returns The last message in the chat, or null if the caller does not have permission or the chat ID is invalid.
   */
  public shared (msg) func lastMessage(chatId : Text) : async ?Message {
    let caller = msg.caller;
    let users = Iter.toArray(Text.split(chatId, #char ':'));
    var hadPermission = false;
    for (element in users.vals()) {
      if (hadPermission == false) {
        let userPrincipal = usermappings.get(element);
        switch (userPrincipal) {
          case (null) { return null };
          case (?principal) {
            if (principal == caller) {
              hadPermission := true;
            };
          };
        };
      };
    };
    if (hadPermission == false) {
      return null;
    };
    return await socio_chats.lastMessage(chatId);
  };

  /**
   * Sends a message to a chat.
   *
   * @param chatId - The ID of the chat.
   * @param sender - The sender of the message.
   * @param message - The content of the message.
   * @param timestamp - The timestamp of the message.
   * @param media - The media attached to the message.
   * @returns A boolean indicating whether the message was sent successfully.
   */
  public shared (msg) func sendMessage(chatId : Text, sender : Text, message : Text, timestamp : Text, media : ?Blob, mediaType : Text) : async Bool {
    let caller = msg.caller;
    let users = Iter.toArray(Text.split(chatId, #char ':'));
    var hadPermission = false;
    for (element in users.vals()) {
      if (hadPermission == false) {
        let userPrincipal = usermappings.get(element);
        switch (userPrincipal) {
          case (null) { return false };
          case (?principal) {
            if (principal == caller) {
              hadPermission := true;
            };
          };
        };
      };
    };
    if (hadPermission == false) {
      return false;
    };
    return await socio_chats.addMessage(chatId, sender, message, timestamp, media, mediaType);
  };

  /**
   * Edits a message in a chat.
   *
   * @param chatId - The ID of the chat.
   * @param chatToEdit - The message to edit.
   * @param oldChat - The original message to be replaced.
   * @returns A boolean indicating whether the message was edited successfully.
   */
  public shared (msg) func editMessage(chatId : Text, chatToEdit : Message, oldChat : Message) : async Bool {
    let caller = msg.caller;
    let users = Iter.toArray(Text.split(chatId, #char ':'));
    var hadPermission = false;
    label loopMessages for (element in users.vals()) {
      if (not hadPermission) {
        let userPrincipal = usermappings.get(element);
        switch (userPrincipal) {
          case (null) { return false };
          case (?principal) {
            if (principal == caller) {
              hadPermission := true;
              break loopMessages;
            };
          };
        };
      };
    };
    if (not hadPermission) {
      return false;
    };
    return await socio_chats.editMessage(chatId, chatToEdit, oldChat);
  };

  /**
   * Deletes a message from a chat.
   *
   * @param chatId - The ID of the chat.
   * @param chatToDelete - The message to delete.
   * @returns A boolean indicating whether the message was successfully deleted.
   */
  public shared (msg) func deleteMessage(chatId : Text, chatToDelete : Message) : async Bool {
    let caller = msg.caller;
    let users = Iter.toArray(Text.split(chatId, #char ':'));
    var hadPermission = false;
    label chatLoop for (element in users.vals()) {
      if (not hadPermission) {
        let userPrincipal = usermappings.get(element);
        switch (userPrincipal) {
          case (null) { return false };
          case (?principal) {
            if (principal == caller) {
              hadPermission := true;
              break chatLoop;
            };
          };
        };
      };
    };
    if (not hadPermission) {
      return false;
    };
    return await socio_chats.deleteMessage(chatId, chatToDelete);
  };

  /**
   * Custom functions ends
   */

  /**
   * Storage cleaner
   */

  public func clearStorage() : async Bool {
    users := HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    usermappings := HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
    notifications := HashMap.HashMap<Principal, Notifications>(10, Principal.equal, Principal.hash);
    mediadata := HashMap.HashMap<Text, MediaData>(10, Text.equal, Text.hash);
    usernames := [];
    let _ = await socio_media.clearMedia();
    return true;
  };

};
