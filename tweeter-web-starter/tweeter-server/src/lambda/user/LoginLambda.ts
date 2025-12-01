import { LoginRequest, LoginResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: LoginRequest): Promise<LoginResponse> => {
    initializeDAOFactory();

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