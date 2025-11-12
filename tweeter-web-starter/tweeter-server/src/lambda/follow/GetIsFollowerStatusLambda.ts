import { IsFollowerRequest, IsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: IsFollowerRequest): Promise<IsFollowerResponse> => {

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