import {
  GetCountRequest,
  GetCountResponse,
  IsFollowerRequest,
  IsFollowerResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL = "https://ccu374urvc.execute-api.us-east-1.amazonaws.com/prod/";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getfollowees");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getfollowers");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFollowerCount(
    request: GetCountRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      GetCountRequest,
      GetCountResponse
    >(request, "/follow/getfollowercount");

    // Handle errors
    if (response.success) {
      if (response.count == null) {
        throw new Error(`No follower count found`);
      } else {
        return response.count;
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFolloweeCount(
    request: GetCountRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      GetCountRequest,
      GetCountResponse
    >(request, "/follow/getfolloweecount");

    // Handle errors
    if (response.success) {
      if (response.count == null) {
        throw new Error(`No follower count found`);
      } else {
        return response.count;
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getIsFollowerStatus(
    request: IsFollowerRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      IsFollowerRequest,
      IsFollowerResponse
    >(request, "/follow/getisfollowerstatus");

    // Handle errors
    if (response.success) {
      if (response.isFollower == null) {
        throw new Error(`No is-follower status found`);
      } else {
        return response.isFollower;
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
  
}