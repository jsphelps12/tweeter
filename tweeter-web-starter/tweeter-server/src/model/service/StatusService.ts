import { AuthToken, Status, FakeData, StatusDto } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService implements Service{

    public async loadMoreFeedItems (
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
      ): Promise<[StatusDto[], boolean]> {
        const [items, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
        return [items.map(status => status.dto), hasMore];
      };

    public async loadMoreStoryItems (
        authToken: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
      ): Promise<[StatusDto[], boolean]> {
        const [items, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
        return [items.map(status => status.dto), hasMore];
      };

    public async postStatus  (
      authToken: string,
      newStatus: StatusDto
    ): Promise<void> {
      // Pause so we can see the logging out message. Remove when connected to the server
      await new Promise((f) => setTimeout(f, 2000));

    };

}