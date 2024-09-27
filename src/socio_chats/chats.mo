/**
 * This module defines an actor that manages chats and messages.
 * It provides functions to add, edit, and delete messages in a chat.
 */

import Bool "mo:base/Bool";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

actor {

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
     * HashMap to store chats, where the key is the chatId and the value is the chat.
     */
    private var chats : HashMap.HashMap<Text, Chat> = HashMap.HashMap<Text, Chat>(10, Text.equal, Text.hash);

    /**
     * Adds a new message to a chat.
     * @param chatId - The ID of the chat.
     * @param sender - The sender of the message.
     * @param message - The content of the message.
     * @param timestamp - The timestamp of the message.
     * @param media - The media attached to the message.
     * @returns true if the message is successfully added, false otherwise.
     */
    public func addMessage(chatId : Text, sender : Text, message : Text, timestamp : Text, media : ?Blob, mediaType : Text) : async Bool {
        let chat = switch (chats.get(chatId)) {
            case (null) { [] };
            case (?c) { c };
        };
        let newChat = Array.append(chat, [{ sender = sender; message = message; timestamp = timestamp; media = media; mediaType = mediaType }]);
        let _ = chats.put(chatId, newChat);
        return true;
    };

    /**
     * Edits a message in a chat.
     * @param chatId - The ID of the chat.
     * @param chatToEdit - The message to edit.
     * @param oldChat - The original message to be replaced.
     * @returns true if the message is successfully edited, false otherwise.
     */
    public func editMessage(chatId : Text, chatToEdit : Message, oldChat : Message) : async Bool {
        let chat = switch (chats.get(chatId)) {
            case (null) { [] };
            case (?c) { c };
        };
        var newChat : [Message] = [];
        for (element in chat.vals()) {
            if (element == oldChat) {
                newChat := Array.append(newChat, [chatToEdit]);
            } else {
                newChat := Array.append(newChat, [element]);
            };
        };
        let _ = chats.put(chatId, newChat);
        return true;
    };

    /**
     * Deletes a message from a chat.
     * @param chatId - The ID of the chat.
     * @param chatToDelete - The message to delete.
     * @returns true if the message is successfully deleted, false otherwise.
     */
    public func deleteMessage(chatId : Text, chatToDelete : Message) : async Bool {
        let chat = switch (chats.get(chatId)) {
            case (null) { [] };
            case (?c) { c };
        };
        let newChat = Array.filter<Message>(chat, func(tempChat : Message) { tempChat != chatToDelete });
        let _ = chats.put(chatId, newChat);
        return true;
    };

    // Retrieves the messages for a specific chat.
    //
    // Arguments:
    // - chatId: The ID of the chat.
    // - username: The username of the user requesting the messages.
    //
    // Returns:
    // - An optional Chat object containing the messages for the specified chat.
    public func getMessages(chatId : Text) : async ?Chat {
        return chats.get(chatId);
    };

    public func lastMessage(chatId : Text) : async ?Message {
        let chat = switch (chats.get(chatId)) {
            case (null) { [] };
            case (?c) { c };
        };
        let lastIndex = Array.size(chat) - 1;
        if (lastIndex >= 0) {
            return ?chat[lastIndex];
        } else {
            return null;
        };
    };

    /*
     * Storage cleaner
     */
    public func clearChats() : async Bool {
        chats := HashMap.HashMap<Text, Chat>(10, Text.equal, Text.hash);
        return true;
    };

};
