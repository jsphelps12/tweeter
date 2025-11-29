import { LogoutRequest, LogoutResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: LogoutRequest): Promise<LogoutResponse> => {
    initializeDAOFactory();

    const userService = new UserService();
    await userService.logout(
        request.token
    );

    return {
        success: true,
        message: null  

    }
};