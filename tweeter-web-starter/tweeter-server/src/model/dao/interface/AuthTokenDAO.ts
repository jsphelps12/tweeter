export interface AuthTokenDAO {

    putAuthToken(token: string, alias: string, timestamp: number): Promise<void>;

    getAuthToken(token: string): Promise<{ token: string; alias: string; timestamp: number } | null>;

    updateAuthToken(token: string, timestamp: number): Promise<void>;

    deleteAuthToken(token: string): Promise<void>;
}
