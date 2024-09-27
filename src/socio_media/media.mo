/**
 * @desc This module defines an actor that manages media objects.
 * The media objects are stored in a HashMap and can be added or retrieved based on their hash.
 * The actor provides functions to add media and get media based on the hash.
 */

import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

actor {
    
    /**
     * @desc Represents a media object.
     * @field typeof - The type of the media.
     * @field media - The content of the media.
     * @field owner - The owner of the media.
     * @field ispublic - Indicates whether the media is public or not.
     */
    type Media = {
        typeof : Text;
        media : Blob;
        owner : Principal;
        ispublic : Bool;
    };

    /**
     * @desc HashMap to store the media objects.
     */
    private var media : HashMap.HashMap<Text, Media> = HashMap.HashMap<Text, Media>(10, Text.equal, Text.hash);

    /**
     * @desc Array to store media objects during upgrade.
     */
    private stable var upgradeMedia : [(Text, Media)] = [];

    /**
     * @desc Function called before an upgrade to store the media objects in the upgradeMedia array.
     */
    system func preupgrade() {
        upgradeMedia := Iter.toArray(media.entries());
    };

    /**
     * @desc Function called after an upgrade to restore the media objects from the upgradeMedia array.
     */
    system func postupgrade() {
        media := HashMap.fromIter(upgradeMedia.vals(), 10, Text.equal, Text.hash);
        upgradeMedia := [];
    };

    /**
     * @desc Function to add a media object.
     * @param hash - The hash of the media object.
     * @param mediaType - The type of the media object.
     * @param mediaContent - The content of the media object.
     * @param ispublic - Indicates whether the media object is public or not.
     * @returns A boolean indicating whether the media object was successfully added.
     */
    public func addMedia(hash : Text, mediaType : Text, mediaContent : Blob,ispublic : Bool, caller : Principal) : async Bool{
        let _ = media.put(hash, {
            typeof = mediaType;
            media = mediaContent;
            owner = caller;
            ispublic = ispublic;
        });
        return true;
    };

    /**
     * @desc Function to get a media object based on its hash.
     * @param hash - The hash of the media object.
     * @returns The media object if it exists and is public or owned by the caller, otherwise null.
     */
    public func getMedia(hash : Text, caller : Principal) : async ?Media {
        let mediaObj = media.get(hash);

        switch (mediaObj){
            case (null) {return null};
            case (?mediaContent){
                if(mediaContent.ispublic == true){
                    return mediaObj;
                } else if (mediaContent.owner == caller){
                    return mediaObj;
                } else {
                    return null;
                };
            };
        };
    };

    /**
     * Storage cleaner
     */

     public func clearMedia() : async Bool {
        media := HashMap.HashMap<Text, Media>(10, Text.equal, Text.hash);
        return true;
     }

};
