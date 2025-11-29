import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: GetUserRequest): Promise<GetUserResponse> => {
    initializeDAOFactory();

    const userService = new UserService();
    const user = await userService.getUser(
        request.token,
        request.alias
    );

    return {
        user: user,
        success: true,
        message: null  

    }
};