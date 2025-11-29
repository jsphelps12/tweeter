import { GetCountRequest, GetCountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: GetCountRequest): Promise<GetCountResponse> => {
    initializeDAOFactory();

    const followService = new FollowService();
    const count = await followService.getFolloweeCount(
        request.token,
        request.user
    );

    return {
        count: count,
        success: true,
        message: null
    }
};