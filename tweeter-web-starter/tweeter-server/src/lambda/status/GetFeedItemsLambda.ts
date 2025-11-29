import { PagedStatusItemRequest, PagedStatusItemResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { initializeDAOFactory } from "../InitializeDAOFactory";

export const handler = async (request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> => {
    initializeDAOFactory();

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