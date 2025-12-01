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
    
    constructor(view: UserInfoView){
        super(view);
        this.followService = new FollowService();
    }

    public getBaseUrl = (): string => {
        const pathSegments = location.pathname.split('/').filter(s => s);
        
        if (pathSegments.length === 0) {
            return "/";
        } else if (pathSegments.length === 1) {
            return `/${pathSegments[0]}`;
        } else {
            return `/${pathSegments[0]}`;
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
      return await this.followService.getIsFollowerStatus(authToken, user, selectedUser);
    };

    public async getFollowerCount (
      authToken: AuthToken,
      user: User
    ): Promise<number> {
      return await this.followService.getFollowerCount(authToken, user);
    };

    public async getFolloweeCount (
      authToken: AuthToken,
      user: User
    ): Promise<number> {
      return await this.followService.getFolloweeCount(authToken, user);
    };


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