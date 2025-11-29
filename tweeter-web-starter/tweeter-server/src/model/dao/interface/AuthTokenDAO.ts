/**
 * Database-agnostic interface for AuthToken data access operations.
 */
export interface AuthTokenDAO {
    /**
     * Stores an authentication token.
     * @param token The token string
     * @param alias The user's alias this token belongs to
     * @param timestamp The token creation timestamp
     */
    putAuthToken(token: string, alias: string, timestamp: number): Promise<void>;

    /**
     * Retrieves authentication token information.
     * @param token The token string
     * @returns The auth token data including alias and timestamp, or null if not found
     */
    getAuthToken(token: string): Promise<{ token: string; alias: string; timestamp: number } | null>;

    /**
     * Updates the timestamp of an authentication token.
     * @param token The token string
     * @param timestamp The new timestamp
     */
    updateAuthToken(token: string, timestamp: number): Promise<void>;

    /**
     * Deletes an authentication token.
     * @param token The token string to delete
     */
    deleteAuthToken(token: string): Promise<void>;
}
