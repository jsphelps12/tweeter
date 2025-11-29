import { AuthToken, UserDto, AuthTokenDto } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/factory/DAOFactory";
import { UserDAO } from "../dao/interface/UserDAO";
import { AuthTokenDAO } from "../dao/interface/AuthTokenDAO";
import { ImageDAO } from "../dao/interface/ImageDAO";
import { AuthHelper } from "./AuthHelper";
import * as bcrypt from "bcryptjs";

export class UserService implements Service {
    private userDAO: UserDAO;
    private authTokenDAO: AuthTokenDAO;
    private imageDAO: ImageDAO;
    private authHelper: AuthHelper;

    constructor() {
        const factory = DAOFactory.getInstance();
        this.userDAO = factory.createUserDAO();
        this.authTokenDAO = factory.createAuthTokenDAO();
        this.imageDAO = factory.createImageDAO();
        this.authHelper = new AuthHelper(this.authTokenDAO);
    }

    public async getUser(
        authToken: string,
        alias: string
    ): Promise<UserDto | null> {
        // Validate the auth token
        await this.authHelper.validateAuthToken(authToken);

        // Remove @ prefix if present (aliases stored without @)
        if (alias.startsWith('@')) {
            alias = alias.substring(1);
        }

        // Get user from database
        const user = await this.userDAO.getUser(alias);
        
        if (!user) {
            return null;
        }

        // Convert to DTO
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            alias: user.alias,
            imageUrl: user.imageUrl
        };
    }

    public async login(
        alias: string,
        password: string
    ): Promise<[UserDto, AuthTokenDto]> {
        // Remove @ prefix if present (aliases stored without @)
        if (alias.startsWith('@')) {
            alias = alias.substring(1);
        }

        // Get user from database
        const user = await this.userDAO.getUser(alias);
        if (!user) {
            throw new Error("[BadRequest] Invalid alias or password");
        }

        // Get and verify password hash
        const passwordHash = await this.userDAO.getPasswordHash(alias);
        if (!passwordHash) {
            throw new Error("[BadRequest] Invalid alias or password");
        }

        const isValidPassword = await bcrypt.compare(password, passwordHash);
        if (!isValidPassword) {
            throw new Error("[BadRequest] Invalid alias or password");
        }

        // Generate auth token
        const token = AuthToken.Generate();
        await this.authTokenDAO.putAuthToken(token.token, alias, token.timestamp);

        // Return user and token DTOs
        const userDto: UserDto = {
            firstName: user.firstName,
            lastName: user.lastName,
            alias: user.alias,
            imageUrl: user.imageUrl
        };

        const authTokenDto: AuthTokenDto = {
            token: token.token,
            timestamp: token.timestamp
        };

        return [userDto, authTokenDto];
    }

    public async logout(authToken: string): Promise<void> {
        // Validate the auth token
        await this.authHelper.validateAuthToken(authToken);

        // Delete the auth token
        await this.authTokenDAO.deleteAuthToken(authToken);
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        // Remove @ prefix if present (aliases stored without @)
        if (alias.startsWith('@')) {
            alias = alias.substring(1);
        }

        // Check if user already exists
        const existingUser = await this.userDAO.getUser(alias);
        if (existingUser) {
            throw new Error("[BadRequest] User with this alias already exists");
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Upload image to S3
        const fileName = `${alias}${imageFileExtension}`;
        const imageUrl = await this.imageDAO.putImage(fileName, userImageBytes);

        // Create user in database
        await this.userDAO.putUser(firstName, lastName, alias, hashedPassword, imageUrl);

        // Generate auth token
        const token = AuthToken.Generate();
        await this.authTokenDAO.putAuthToken(token.token, alias, token.timestamp);

        // Return user and token DTOs
        const userDto: UserDto = {
            firstName,
            lastName,
            alias,
            imageUrl
        };

        const authTokenDto: AuthTokenDto = {
            token: token.token,
            timestamp: token.timestamp
        };

        return [userDto, authTokenDto];
    }
}