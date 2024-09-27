export function generateChatID(username1, username2) {
    return [username1, username2].sort().join(':');
}