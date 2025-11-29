import { FollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: FollowRequest): Promise<FollowResponse> => {
    initializeDAOFactory();

    const followService = new FollowService();
    const [followerCount, followeeCount] = await followService.follow(
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