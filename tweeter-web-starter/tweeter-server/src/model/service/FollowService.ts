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
      authToken: AuthToken,
      user: User,
      selectedUser: User
    ): Promise<boolean> {
      // TODO: Replace with the result of calling server
      return FakeData.instance.isFollower();
    };

    public async follow  (
        authToken: AuthToken,
        userToFollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the follow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server

        const followerCount = await this.getFollowerCount(authToken.token, userToFollow.dto);
        const followeeCount = await this.getFolloweeCount(authToken.token, userToFollow.dto);

        return [followerCount, followeeCount];
    };

    public async unfollow  (
        authToken: AuthToken,
        userToUnfollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the unfollow message. Remove when connected to the server
        await new Promise((f) => setTimeout(f, 2000));

        // TODO: Call the server

        const followerCount = await this.getFollowerCount(authToken.token, userToUnfollow.dto);
        const followeeCount = await this.getFolloweeCount(authToken.token, userToUnfollow.dto);

        return [followerCount, followeeCount];
    };

    private async getFakeData(lastItem: UserDto | null, pageSize: number, userAlias: string): Promise<[UserDto[], boolean]> {
      const [items, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
      const itemsDto = items.map((user) => user.dto);
      return [itemsDto, hasMore];
    }    

}