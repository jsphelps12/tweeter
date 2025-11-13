import { RegisterRequest, RegisterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (request: RegisterRequest): Promise<RegisterResponse> => {

    const userService = new UserService();
    const [user, authToken] = await userService.register(
        request.firstName,
        request.lastName,
        request.alias,
        request.password,
        request.userImageBytes,
        request.imageFileExtension
    );

    return {
        user: user,
        authToken: authToken,
        success: true,
        message: null  

    }
};