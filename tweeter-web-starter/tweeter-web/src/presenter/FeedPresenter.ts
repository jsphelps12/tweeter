import { AuthToken, Status } from "tweeter-shared";
import { StatusItemPresenter } from "./StatusItemPresenter";
import { PAGE_SIZE, PagedItemView } from "./PagedItemPresenter";


export class FeedPresenter extends StatusItemPresenter{

    protected itemDescription(): string {
      return "load feed items ";
    }
    protected getMoreItemsImplementation(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
      return this.service.loadMoreFeedItems(
        authToken,
        userAlias,
        PAGE_SIZE,
        this.lastItem
      );
    }
}