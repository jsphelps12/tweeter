import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";

export class AuthHelper {
    private authTokenDAO: AuthTokenDAO;

    constructor(authTokenDAO: AuthTokenDAO) {
        this.authTokenDAO = authTokenDAO;
    }

    public async validateAuthToken(token: string): Promise<string> {
        const authToken = await this.authTokenDAO.getAuthToken(token);

        if (!authToken) {
            throw new Error("[unauthorized] Invalid or expired authentication token");
        }

        const currentTime = Date.now();
        const tokenAge = currentTime - authToken.timestamp;
        const fifteenMinutes = 15 * 60 * 1000;

        if (tokenAge > fifteenMinutes) {
            await this.authTokenDAO.deleteAuthToken(token);
            throw new Error("[unauthorized] Authentication token has expired");
        }

        await this.authTokenDAO.updateAuthToken(token, currentTime);

        return authToken.alias;
    }
}
