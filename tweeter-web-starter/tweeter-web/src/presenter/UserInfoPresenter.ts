import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { NavigateFunction } from "react-router-dom";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView{
  setIsFollower: (isFollower: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFollowerCount: (followerCount: number) => void;
  setFolloweeCount: (followeeCount: number) => void;
  setDisplayedUser: (user: User) => void;
  navigate: NavigateFunction;
}


export class UserInfoPresenter extends Presenter<UserInfoView> {
    private followService: FollowService;
    // private _isFollower =false;
    // private _followeeCount = -1;
    // private _followerCount = -1;
    
    constructor(view: UserInfoView){
        super(view);
        this.followService = new FollowService();
    }

    public getBaseUrl = (): string => {
        // Get the base path (e.g., "/story" or "/feed") by removing the last segment (username)
        // Handles paths like: /story/user1 -> /story, /feed/user2 -> /feed
        const pathSegments = location.pathname.split('/').filter(s => s);
        
        if (pathSegments.length === 0) {
            return "/"; // Root path
        } else if (pathSegments.length === 1) {
            return `/${pathSegments[0]}`; // Already at base (e.g., /story)
        } else {
            return `/${pathSegments[0]}`; // Return first segment (e.g., /story from /story/user1)
        }
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
      return await this.followService.getIsFollowerStatus(authToken, user, selectedUser);
    };

    public async getFollowerCount (
      authToken: AuthToken,
      user: User
    ): Promise<number> {
      // TODO: Replace with the result of calling server
      return await this.followService.getFollowerCount(authToken, user);
    };

    public async getFolloweeCount (
      authToken: AuthToken,
      user: User
    ): Promise<number> {
      // TODO: Replace with the result of calling server
      return await this.followService.getFolloweeCount(authToken, user);
    };

    // public async follow  (
    //     authToken: AuthToken,
    //     userToFollow: User
    // ): Promise<[followerCount: number, followeeCount: number]> {
    //     // Pause so we can see the follow message. Remove when connected to the server
    //     return await this.followService.follow(authToken, userToFollow);
    // };

    // public async unfollow  (
    //     authToken: AuthToken,
    //     userToUnfollow: User
    // ): Promise<[followerCount: number, followeeCount: number]> {
    //     // Pause so we can see the unfollow message. Remove when connected to the server
    //     return await this.followService.unfollow(authToken, userToUnfollow);
    // };

    // public async followDisplayedUser (
    //     authToken: AuthToken,
    //     displayedUser: User
    // ): Promise<void> {

    //     var followingUserToast = "";
    //     await this.doFailureReportingOperation(async () => {
    //       this.view.setIsLoading(true);
    //       followingUserToast = this.view.displayInfoMessage(
    //           `Following ${displayedUser!.name}...`,
    //           0
    //       );

    //       const [followerCount, followeeCount] = await this.followService.follow(
    //           authToken!,
    //           displayedUser!
    //       );

    //       this.view.setIsFollower(true);
    //       this.view.setFollowerCount(followerCount);
    //       this.view.setFolloweeCount(followeeCount);
    //     },"follow user");
    //     this.view.deleteMessage(followingUserToast);
    //     this.view.setIsLoading(false);
    // };

    // public async unfollowDisplayedUser (
    //     authToken: AuthToken,
    //     displayedUser: User
    // ): Promise<void>{
    //     var unfollowingUserToast = "";
    //     await this.doFailureReportingOperation(async () => {
    //       this.view.setIsLoading(true);
    //       unfollowingUserToast = this.view.displayInfoMessage(
    //           `Unfollowing ${displayedUser!.name}...`,
    //           0
    //       );

    //       const [followerCount, followeeCount] = await this.followService.unfollow(
    //           authToken!,
    //           displayedUser!
    //       );

    //       this.view.setIsFollower(false);
    //       this.view.setFollowerCount(followerCount);
    //       this.view.setFolloweeCount(followeeCount);
    //     }, "unfollow user");
    //     this.view.deleteMessage(unfollowingUserToast);
    //     this.view.setIsLoading(false);
    // };

    public async runFollowOperation(
      itemDescription: string,
      infoMessage: string,
      followOperation: () => Promise<[followerCount: number, followeeCount: number]>,
      updateView: (followerCount: number, followeeCount: number) => void
    ): Promise<void> {
      var operationToast = "";
      await this.doFailureReportingOperation(async () => {
        this.view.setIsLoading(true);
        operationToast = this.view.displayInfoMessage(
            infoMessage,
            0
        );

        const [followerCount, followeeCount] = await followOperation();

        updateView(followerCount, followeeCount);
      }, itemDescription);
      this.view.deleteMessage(operationToast);
      this.view.setIsLoading(false);
    };

    public async followDisplayedUser (
        authToken: AuthToken,
        displayedUser: User
    ): Promise<void> {
        await this.runFollowOperation(
          "follow user",
          `Following ${displayedUser.name}...`,
          async () => await this.followService.follow(authToken, displayedUser),
          (followerCount, followeeCount) => {
            this.view.setIsFollower(true);
            this.view.setFollowerCount(followerCount);
            this.view.setFolloweeCount(followeeCount);
          }
        );
    };

    public async unfollowDisplayedUser (
        authToken: AuthToken,
        displayedUser: User
    ): Promise<void> {
        await this.runFollowOperation(
          "unfollow user",
          `Unfollowing ${displayedUser.name}...`,
          async () => await this.followService.unfollow(authToken, displayedUser),
          (followerCount, followeeCount) => {
            this.view.setIsFollower(false);
            this.view.setFollowerCount(followerCount);
            this.view.setFolloweeCount(followeeCount);
          }
        );
    };
}