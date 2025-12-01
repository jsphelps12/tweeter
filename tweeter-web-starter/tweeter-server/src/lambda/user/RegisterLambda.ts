import { RegisterRequest, RegisterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: RegisterRequest): Promise<RegisterResponse> => {
    initializeDAOFactory();

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