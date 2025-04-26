/**
 * Represents the data structure required for user signup.
 * Typically sent from the client to the server.
 */
export interface SignupUser {
    /** User's email address, used for login and communication. */
    email: string;

    /** User's chosen password (will be hashed by the backend). */
    password: string;

    /** The ID of the city ('citta') the user belongs to. */
    cittaId: number; // Changed from citta_id for camelCase consistency

    /** User's first name ('nome'). */
    nome: string;

    /** User's last name ('cognome'). */
    cognome: string;

    /**
     * Optional profile picture file uploaded during signup.
     * Use `File` type on the client-side for handling uploads.
     * Use `null` or `undefined` if no file is selected.
     */
    immagineProfilo?: File | null; // Changed from immagine_profilo and made optional
}

/**
 * Represents the data structure required for user login.
 */
export interface LoginUser {
    /** User's email address. */
    email: string;

    /** User's password. */
    password: string;
}

// --- Dependent Interfaces ---

/**
 * Represents a City ('Citta').
 */
export interface Citta {
    id: number;
    nome: string;
}

/**
 * Represents a User Authority/Role (e.g., 'ROLE_USER', 'ROLE_ADMIN').
 */
export interface Authority {
    /** The name of the authority granted to the user. */
    authority: string; // Changed structure from { authorities: string } for clarity
}

/**
 * Represents a Game ('Gioco').
 * NOTE: Define the actual properties of a game object here.
 */
export interface Gioco {
    id: number;
    nome: string;
    // Add other relevant game properties like description, genre, imageURL, etc.
    // exampleProperty: any;
}

/**
 * Represents a User's Favorite ('Preferito').
 */
export interface Preferito {
    id: number;

    /** The game ('gioco') object marked as favorite. */
    gioco: Gioco; // Use the specific Gioco interface instead of any[any]

    /**
     * Indicates if the favorite entry is currently active.
     * Note: Might be redundant if `deletedAt` is used for soft deletion. Review if both are needed.
     */
    isActive: boolean;

    /** ISO 8601 date string when the favorite was created. */
    createdAt: string; // Corrected type 'String' to 'string'

    /**
     * The date part of when the favorite was created.
     * Note: Often redundant if `createdAt` already contains the full timestamp. Review necessity.
     */
    createdAtDate?: string | null; // Made optional as it might be redundant

    /** ISO 8601 date string when the favorite was last modified. */
    modifiedAt: string | null; // Assuming modification is possible and can be null if never modified

    /** ISO 8601 date string when the favorite was soft-deleted, or null if not deleted. */
    deletedAt: string | null;
}


/**
 * Represents the detailed User object, typically received from the backend
 * after authentication or when fetching user data.
 */
export interface User {
    /** Unique identifier for the user. */
    id: number;

    /** User's email address (often used as the username). */
    email: string;

    /**
     * Username used by the security framework (e.g., Spring Security).
     * Often the same as the email.
     */
    username: string;

    /** User's first name ('nome'). */
    nome: string;

    /** User's last name ('cognome'). */
    cognome: string;

    /**
     * A convenient combination of first and last name.
     * Note: This might be derived data; could be constructed on the client if needed.
     */
    fullName: string;

    /** URL or path to the user's profile picture. */
    immagineProfilo: string | null; // Allow null if no image exists

    /** The user's associated city ('citta'). */
    citta: Citta;

    /**
     * Primary role of the user (e.g., 'USER', 'ADMIN').
     * Note: May overlap with `authorities`. Check application logic for distinction.
     */
    role: string;

    /** Detailed list of permissions/roles granted to the user. */
    authorities: Authority[]; // Use the clearer Authority interface

    /** Indicates if the user's account is active/enabled (standard Spring Security property). */
    enabled: boolean;

    /** Indicates if the user's account has not expired (standard Spring Security property). */
    accountNonExpired: boolean;

    /** Indicates if the user's account is not locked (standard Spring Security property). */
    accountNonLocked: boolean;

    /** Indicates if the user's credentials (password) have not expired (standard Spring Security property). */
    credentialsNonExpired: boolean;

    /**
     * Indicates if the user account is generally considered active within the application logic.
     * Note: Might be redundant with `enabled`. Review application logic.
     */
    active: boolean;

    /** ISO 8601 date string when the user account was created. */
    createdAt: string;

    /**
     * The date part of when the user account was created.
     * Note: Often redundant if `createdAt` already contains the full timestamp. Review necessity.
     */
    createdAtDate?: string | null; // Made optional as it might be redundant

    /** ISO 8601 date string when the user account was soft-deleted, or null if not deleted. */
    deletedAt: string | null;

    /** A temporary code used for processes like password change verification. Null if not applicable. */
    changePasswordCode: string | null;

    /** A list of the user's favorite items (e.g., games). */
    preferiti: Preferito[]; // Use the specific Preferito interface

    // Removed 'password' field: The backend should NEVER send the user's password
    // (even hashed) back to the client in the User object due to security risks.
}
