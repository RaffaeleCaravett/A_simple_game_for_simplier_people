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
    }
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