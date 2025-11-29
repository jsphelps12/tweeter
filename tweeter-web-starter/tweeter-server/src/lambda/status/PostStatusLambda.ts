import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: PostStatusRequest): Promise<PostStatusResponse> => {
    initializeDAOFactory();

    const statusService = new StatusService();
    await statusService.postStatus(
        request.token,
        request.newStatus
    );

    return {
        success: true,
        message: null  

    }
};