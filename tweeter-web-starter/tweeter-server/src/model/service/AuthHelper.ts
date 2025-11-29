import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";

/**
 * Helper class for authentication-related operations.
 */
export class AuthHelper {
    private authTokenDAO: AuthTokenDAO;

    constructor(authTokenDAO: AuthTokenDAO) {
        this.authTokenDAO = authTokenDAO;
    }

    /**
     * Validates an auth token and returns the associated user alias.
     * Updates the token timestamp for activity tracking.
     * @param token The token to validate
     * @returns The user alias associated with the token
     * @throws Error if token is invalid or expired
     */
    public async validateAuthToken(token: string): Promise<string> {
        const authToken = await this.authTokenDAO.getAuthToken(token);

        if (!authToken) {
            throw new Error("[Unauthorized] Invalid or expired authentication token");
        }

        // Check if token is expired (15 minutes of inactivity)
        const currentTime = Date.now();
        const tokenAge = currentTime - authToken.timestamp;
        const fifteenMinutes = 15 * 60 * 1000;

        if (tokenAge > fifteenMinutes) {
            await this.authTokenDAO.deleteAuthToken(token);
            throw new Error("[Unauthorized] Authentication token has expired");
        }

        // Update token timestamp for activity tracking
        await this.authTokenDAO.updateAuthToken(token, currentTime);

        return authToken.alias;
    }
}
