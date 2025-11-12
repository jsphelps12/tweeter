import { FollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: FollowRequest): Promise<FollowResponse> => {

    const followService = new FollowService();
    const [followerCount, followeeCount] = await followService.unfollow(
        request.token,
        request.userToFollow
    );

    return {
        followerCount: followerCount,
        followeeCount: followeeCount,
        success: true,
        message: null
    }
};