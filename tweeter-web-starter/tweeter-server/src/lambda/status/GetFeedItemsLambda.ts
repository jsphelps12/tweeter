import { PagedStatusItemRequest, PagedStatusItemResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> => {

    const statusService = new StatusService();
    const [items, hasMore] = await statusService.loadMoreFeedItems(
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