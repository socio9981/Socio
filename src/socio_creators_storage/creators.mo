import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Int "mo:base/Int";

actor {

    type Creator = {
        username : Text;
        creatorLogo : Blob;
        bio : Text;
        subscribers : [Text];
        shorts : [Text];
        longs : [Text];
    };

    type Media = {
        title : Text;
        description : Text;
        video : Blob;
        likes : [Text];
        views : Int;
        date : Text;
    };

    private var creators : HashMap.HashMap<Principal, Creator> = HashMap.HashMap<Principal, Creator>(10, Principal.equal, Principal.hash);

    private var media : HashMap.HashMap<Text, Media> = HashMap.HashMap<Text, Media>(10, Text.equal, Text.hash);

    public shared (msg) func caller() : async Principal {
        return msg.caller;
    };

    public shared (msg) func registerAsCreator(username : Text, creatorLogo : Blob, bio : Text) : async Text {
        let tempCreator = creators.get(msg.caller);
        if (tempCreator != null) {
            return "Already Registered As Creator.";
        };
        let creator : Creator = {
            username = username;
            creatorLogo = creatorLogo;
            bio = bio;
            subscribers = [];
            shorts = [];
            longs = [];
        };
        let _ = creators.put(msg.caller, creator);
        return "Register As Creator.";
    };

    public shared (msg) func loginAsCreator() : async ?Creator {
        let currentCreator = creators.get(msg.caller);
        switch (currentCreator) {
            case (?creator) {
                return ?creator;
            };
            case null {
                return null;
            };
        };
    };

    public shared (msg) func uploadMedia(title : Text, description : Text, video : Blob, tyepOfVideo : Text, date : Text, id : Text) : async Text {
        let currentCreator = creators.get(msg.caller);
        switch (currentCreator) {
            case (?currentCreator) {
                let currenentMedia : Media = {
                    title = title;
                    description = description;
                    video = video;
                    likes = [];
                    views = 0;
                    date = date;
                };
                let _ = media.put(id, currenentMedia);
                if (tyepOfVideo == "short") {
                    let newCreator : Creator = {
                        username = currentCreator.username;
                        creatorLogo = currentCreator.creatorLogo;
                        bio = currentCreator.bio;
                        subscribers = currentCreator.subscribers;
                        shorts = Array.append(currentCreator.shorts, [id]);
                        longs = currentCreator.longs;
                    };
                    let _ = creators.put(msg.caller, newCreator);
                } else {
                    let newCreator : Creator = {
                        username = currentCreator.username;
                        creatorLogo = currentCreator.creatorLogo;
                        bio = currentCreator.bio;
                        subscribers = currentCreator.subscribers;
                        shorts = currentCreator.shorts;
                        longs = Array.append(currentCreator.longs, [id]);
                    };
                    let _ = creators.put(msg.caller, newCreator);
                };
                return "Media Uploaded.";
            };
            case null {
                return "Not Registered As Creator.";
            };
        };

    };

    public func getMedia(id : Text) : async ?Media {
        let currentMedia = media.get(id);
        switch (currentMedia) {
            case (?currentMedia) {
                return ?currentMedia;
            };
            case null {
                return null;
            };
        };
    };

};