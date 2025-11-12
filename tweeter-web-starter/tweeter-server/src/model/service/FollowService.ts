import { AuthToken, FakeData, User, UserDto } from "tweeter-shared";
import { Service } from "./Service";

export class FollowService implements Service{
    

    public async loadMoreFollowees(
      authToken: string,
      userAlias: string,
      pageSize: number,
      lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]>{
      return this.getFakeData(lastItem, pageSize, userAlias);
    };

  public async loadMoreFollowers(
      authToken: string,
      userAlias: string,
      pageSize: number,
      lastItem: UserDto | null
    ): Promise<[UserDto[], boolean]>{
      return this.getFakeData(lastItem, pageSize, userAlias);
    };

  public async getFolloweeCount (
      authToken: string,
      user: UserDto
    ): Promise<number> {
      return FakeData.instance.getFolloweeCount(user.alias);
    };

  public async getFollowerCount  (
      authToken: string,
      user: UserDto
    ): Promise<number> {
      // TODO: Replace with the result of calling server
      return FakeData.instance.getFollowerCount(user.alias);
    };

  public async getIsFollowerStatus (
      authToken: string,
      user: UserDto,
      selectedUser: UserDto
    ): Promise<boolean> {
      return FakeData.instance.isFollower();
    };

    public async follow  (
        authToken: string,
        userToFollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the follow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        const followerCount = await this.getFollowerCount(authToken, userToFollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

        return [followerCount, followeeCount];
    };

    public async unfollow  (
        authToken: string,
        userToUnfollow: UserDto
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the unfollow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
        const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

        return [followerCount, followeeCount];
    };

    private async getFakeData(lastItem: UserDto | null, pageSize: number, userAlias: string): Promise<[UserDto[], boolean]> {
      const [items, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
      const itemsDto = items.map((user) => user.dto);
      return [itemsDto, hasMore];
    }    

}