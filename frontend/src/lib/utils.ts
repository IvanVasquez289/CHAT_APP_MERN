export const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}