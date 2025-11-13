import { LoginRequest, LoginResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (request: LoginRequest): Promise<LoginResponse> => {

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