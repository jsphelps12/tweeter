import { LoginRequest, LoginResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: LoginRequest): Promise<LoginResponse> => {
    initializeDAOFactory();

    // // Validation for 400 Bad Request
    // if (!request.alias || request.alias.trim() === '') {
    //     throw new Error('[bad-request] Alias is required');
    // }
    // if (!request.password || request.password.trim() === '') {
    //     throw new Error('[bad-request] Password is required');
    // }

    const userService = new UserService();
    const [user, authToken] = await userService.login(
        request.alias,
        request.password
    );

    return {
        user: user,
        authToken: authToken,
        success: true,
        message: null  

    }
};