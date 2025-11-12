
import { GetCountRequest, GetCountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: GetCountRequest): Promise<GetCountResponse> => {

    const followService = new FollowService();
    const count = await followService.getFollowerCount(
        request.token,
        request.user
    );

    return {
        count: count,
        success: true,
        message: null
    }
};