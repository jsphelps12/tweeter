import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: PagedUserItemRequest): Promise<PagedUserItemResponse> => {

    const followService = new FollowService();
    const [items, hasMore] = await followService.loadMoreFollowers(
        request.token,
        request.userAlias,
        request.pageSize,
        request.lastItem
    );

    return {
        items: items,
        hasMore: hasMore,
        success: true,
        message: null  

    }
};