import { IsFollowerRequest, IsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: IsFollowerRequest): Promise<IsFollowerResponse> => {
    initializeDAOFactory();

    const followService = new FollowService();
    const bool = await followService.getIsFollowerStatus(
        request.token,
        request.user,
        request.selectedUser
    );

    return {
        isFollower: bool,
        success: true,
        message: null
    }
};