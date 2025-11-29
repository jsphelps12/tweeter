import { RegisterRequest, RegisterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: RegisterRequest): Promise<RegisterResponse> => {
    initializeDAOFactory();

    // // Validation for 400 Bad Request
    // if (!request.firstName || request.firstName.trim() === '') {
    //     throw new Error('[bad-request] First name is required');
    // }
    // if (!request.lastName || request.lastName.trim() === '') {
    //     throw new Error('[bad-request] Last name is required');
    // }
    // if (!request.alias || request.alias.trim() === '') {
    //     throw new Error('[bad-request] Alias is required');
    // }
    // if (!request.password || request.password.trim() === '') {
    //     throw new Error('[bad-request] Password is required');
    // }
    // if (!request.userImageBytes || request.userImageBytes.trim() === '') {
    //     throw new Error('[bad-request] User image is required');
    // }

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