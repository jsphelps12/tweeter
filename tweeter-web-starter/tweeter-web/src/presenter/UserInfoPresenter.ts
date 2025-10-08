import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";

export interface UserInfoView{
//   setLoading: (isLoading: boolean) => void;
//   setIsFollower: (isFollower: boolean) => void;
//   setFollowCounts: (followerCount: number, followeeCount: number) => void;
//   displayInfoMessage: (message: string, duration?: number) => string;
//   deleteMessage: (id: string) => void;
  displayErrorMessage: (message: string) => void;
}


export class UserInfoPresenter {
    private followService: FollowService;
    private _view: UserInfoView;
    private _isFollower =false;
    private _followeeCount = -1;
    private _followerCount = -1;
    
    constructor(view: UserInfoView){
        this._view = view;
        this.followService = new FollowService();
    }

    public get view() {
        return this._view;
    }

    public get isFollower() {
        return this._isFollower;
    }

    public get followeeCount() {
        return this._followeeCount;
    }

    public get followerCount() {
        return this._followerCount;
    }   

    public set isFollower(value: boolean) {
        this._isFollower = value;
    }

    public set followeeCount(value: number) {
        this._followeeCount = value;
    }

    public set followerCount(value: number) {
        this._followerCount = value;
    }

    public async setNumbFollowees (
        authToken: AuthToken,
        displayedUser: User
    ) {
        try {
        this._followeeCount = await this.getFolloweeCount(authToken, displayedUser);
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to get followees count because of exception: ${error}`
        );
        }
    };

    public async setNumbFollowers (
        authToken: AuthToken,
        displayedUser: User
    ) {
        try {
        this._followerCount = await this.getFollowerCount(authToken, displayedUser);
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to get followers count because of exception: ${error}`
        );
        }
    };

  public async setIsFollowerStatus (
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    try {
      if (currentUser === displayedUser) {
        this._isFollower = false;
      } else {
        this._isFollower = await this.getIsFollowerStatus(authToken!, currentUser!, displayedUser!);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`
      );
    }
  };

  public async getIsFollowerStatus (
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    // TODO: Replace with the result of calling server
    return this.followService.getIsFollowerStatus(authToken, user, selectedUser);
  };

    public async getFollowerCount (
        authToken: AuthToken,
        user: User
      ): Promise<number> {
        // TODO: Replace with the result of calling server
        return this.followService.getFollowerCount(authToken, user);
      };

      public async getFolloweeCount (
        authToken: AuthToken,
        user: User
      ): Promise<number> {
        // TODO: Replace with the result of calling server
        return this.followService.getFolloweeCount(authToken, user);
      };

    public async follow  (
        authToken: AuthToken,
        userToFollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the follow message. Remove when connected to the server
        return this.followService.follow(authToken, userToFollow);
    };

    public async unfollow  (
        authToken: AuthToken,
        userToUnfollow: User
    ): Promise<[followerCount: number, followeeCount: number]> {
        // Pause so we can see the unfollow message. Remove when connected to the server
        return this.followService.unfollow(authToken, userToUnfollow);
    };
}