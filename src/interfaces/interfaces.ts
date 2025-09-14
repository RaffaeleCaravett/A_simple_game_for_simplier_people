import { MoveType, NotificationType } from "../enums/enums"

export interface SignupUser {
    email: string,
    password: string,
    citta_id: number,
    nome: string,
    cognome: string,
    immagine_profilo: File
}

export interface LoginUser {
    email: string,
    password: string
}

export interface User {
    accountNonExpired: boolean
    accountNonLocked: boolean
    active: boolean
    authorities: { authorities: string }[]
    changePasswordCode: string | null
    citta: { id: number, nome: string }
    cognome: string
    createdAt: string
    createdAtDate: string | null
    credentialsNonExpired: boolean
    deletedAt: string | null
    email: string
    enabled: boolean
    id: number
    immagineProfilo: string
    nome: string
    password: string
    role: string,
    username: string
    fullName: string,
    preferiti: {
        id: number,
        gioco: any[any],
        isActive: boolean,
        createdAt: String,
        createdAtDate: string,
        modifiedAt: string,
        deletedAt: string
    }[],
    completed: boolean,
    descrizione: {
        id: number,
        textAlignment: string,
        innerHTML: string
    },
    isConnected: boolean,
    open: boolean,
    availableUsers: User[],
    blocked: number[]
}
export interface Categoria {
    id: number,
    nome: string
}

export interface Gioco {
    id: number,
    nomeGioco: string;
    difficolta: number;
    image: string;
    descrizione: string;
    recensione: Recensione[];
    totalRecensioniNumber: number;
    categorie: Categoria[];
    active: boolean;
}

export interface Recensione {
    id: number,
    commento: string,
    commentoPreview: string,
    punteggio: number
    user: User,
    createdAt: string,
    modifiedAt: string,
    deletedAt: string
}

export interface Message {
    message: string,
    riceventi: number[],
    mittente: number,
    chat: number
}
export interface Chat {
    id: number,
    utenti: User[],
    messaggi: Messaggio[],
    createdAt: string,
    title: string,
    image: string,
    chatType: string,
    administrators: User[]
}
export interface ChatDTO {
    userId: number[],
    title: string | null,
    chatType: string | null,
    administrators: number[] | null
}

export interface Messaggio {
    id: number,
    sender: User,
    state: string,
    text: string,
    createdAt: string,
    settedChatId: number,
    receivers: number[],
    readers: number[]
}

export interface Notification {
    id: number,
    testo: string,
    chat: Chat,
    sender: User,
    state: string,
    createdAt: string,
    notificationType: string
}

export interface UserConnection {
    id: number,
    connected: boolean
}

export interface SocketDTO {
    connectionRequestDTO: ConnectionRequestDTO | null | {},
    messageDTO: Message | null | {},
    moveDTO: MoveDTO | null | {},
    gameConnectionDTO: GameConnectionDTO | null | {},
    connectionDTO: ConnectionDTO | null | {}
}
export interface ConnectionDTO {
    userId: number
}
export interface GameConnectionDTO {
    giocoId: number,
    userId: number,
    connected: boolean
}
export interface MoveDTO {
    id: number,
    idDiv: string | null,
    moveType: MoveType,
    oppositeUser: number,
    senderUser: number,
    invitationId: number | null,
    partitaId: number | null,
    senderScore: number | null,
    oppositeScore: number | null,
    userTimeoutId: number | null,
    moverId: number | null
}

export interface ConnectionRequestDTO {
    receiverId: number
}
