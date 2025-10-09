import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { NavigateFunction } from "react-router-dom";

export interface UserInfoView{
  setIsFollower: (isFollower: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFollowerCount: (followerCount: number) => void;
  setFolloweeCount: (followeeCount: number) => void;
  setDisplayedUser: (user: User) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (id: string) => void;
  displayErrorMessage: (message: string) => void;
  navigate: NavigateFunction;
}


export class UserInfoPresenter {
    private followService: FollowService;
    private _view: UserInfoView;
    // private _isFollower =false;
    // private _followeeCount = -1;
    // private _followerCount = -1;
    
    constructor(view: UserInfoView){
        this._view = view;
        this.followService = new FollowService();
    }

    public get view() {
        return this._view;
    }

    // public get isFollower() {
    //     return this._isFollower;
    // }

    // public get followeeCount() {
    //     return this._followeeCount;
    // }

    // public get followerCount() {
    //     return this._followerCount;
    // }   

    // public set isFollower(value: boolean) {
    //     this._isFollower = value;
    // }

    // public set followeeCount(value: number) {
    //     this._followeeCount = value;
    // }

    // public set followerCount(value: number) {
    //     this._followerCount = value;
    // }

    public getBaseUrl = (): string => {
        const segments = location.pathname.split("/@");
        return segments.length > 1 ? segments[0] : "/";
    };

    public switchToLoggedInUser(currentUser: User): void {
        this.view.setDisplayedUser(currentUser!);
        this.view.navigate(`${this.getBaseUrl()}/${currentUser!.alias}`);
    };

    public async setNumbFollowees (
        authToken: AuthToken,
        displayedUser: User
    ) {
        try {
        this.view.setFolloweeCount(await this.getFolloweeCount(authToken, displayedUser));
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
        this.view.setFollowerCount(await this.getFollowerCount(authToken, displayedUser));
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
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(await this.getIsFollowerStatus(authToken!, currentUser!, displayedUser!));
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

    public async followDisplayedUser (
        authToken: AuthToken,
        displayedUser: User
    ): Promise<void> {

        var followingUserToast = "";

        try {
        this.view.setIsLoading(true);
        followingUserToast = this.view.displayInfoMessage(
            `Following ${displayedUser!.name}...`,
            0
        );

        const [followerCount, followeeCount] = await this.follow(
            authToken!,
            displayedUser!
        );

        this.view.setIsFollower(true);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
        // presenterRef.current!.isFollower = true;
        // presenterRef.current!.followerCount = followerCount;
        // presenterRef.current!.followeeCount = followeeCount;
        //
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to follow user because of exception: ${error}`
        );
        } finally {
        this.view.deleteMessage(followingUserToast);
        this.view.setIsLoading(false);
        }
    };

    public async unfollowDisplayedUser (
        authToken: AuthToken,
        displayedUser: User
    ): Promise<void>{
        var unfollowingUserToast = "";

        try {
        this.view.setIsLoading(true);
        unfollowingUserToast = this.view.displayInfoMessage(
            `Unfollowing ${displayedUser!.name}...`,
            0
        );

        const [followerCount, followeeCount] = await this.unfollow(
            authToken!,
            displayedUser!
        );

        this.view.setIsFollower(false);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
        // presenterRef.current!.isFollower = false;
        // presenterRef.current!.followerCount = followerCount;
        // presenterRef.current!.followeeCount = followeeCount;
        
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to unfollow user because of exception: ${error}`
        );
        } finally {
        this.view.deleteMessage(unfollowingUserToast);
        this.view.setIsLoading(false);
        }
    };
}