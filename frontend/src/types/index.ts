export type SignUpData = {
    fullName: string,
    email: string,
    password: string
}

export type LoginData = {
    email: string,
    password: string
}

export type AuthUser = {
    _id: string,
    __v: number,
    email: string,
    fullName: string,
    profilePic: string,
    createdAt: string,
    updatedAt: string,
}

export type ChatUser = {
    _id: string,
    fullName: string,
    profilePic: string,
    email: string,
    createdAt: string,
    updatedAt: string
}

export type MessageData = {
    text?: string, 
    image?: string
}

export type Message = {
    _id: string,
    senderId: string,
    receiverId: string,
    text: string,
    image: string,
    createdAt: string,
    updatedAt: string,
    __v: number
}