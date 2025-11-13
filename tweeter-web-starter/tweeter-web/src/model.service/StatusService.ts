import { AuthToken, Status, FakeData } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class StatusService implements Service{
    private serverFacade = new ServerFacade();

    public async loadMoreFeedItems (
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastItem: Status | null
      ): Promise<[Status[], boolean]> {
        const request = {
          token: authToken.token,
          userAlias: userAlias,
          pageSize: pageSize,
          lastItem: lastItem ? lastItem.dto : null
        };
        return this.serverFacade.getMoreFeedItems(request);
      };

    public async loadMoreStoryItems (
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastItem: Status | null
      ): Promise<[Status[], boolean]> {
        const request = {
          token: authToken.token,
          userAlias: userAlias,
          pageSize: pageSize,
          lastItem: lastItem ? lastItem.dto : null
        };
        return this.serverFacade.getMoreStoryItems(request);
      };

    public async postStatus  (
      authToken: AuthToken,
      newStatus: Status
    ): Promise<void> {
      const request = {
        token: authToken.token,
        newStatus: newStatus.dto
      };
      this.serverFacade.postStatus(request);
    };

}