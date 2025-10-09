import { NavigateFunction } from "react-router-dom";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";


export interface AppNavbarView {
    navigate: NavigateFunction;
    displayErrorMessage: (message: string) => void;
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (id: string) => void;
    clearUserInfo: () => void;
}

export class AppNavbarPresenter {
    private _view: AppNavbarView;
    private UserService: UserService
    
    constructor(view: AppNavbarView){
        this._view = view;
        this.UserService = new UserService();
    }

    public get view() {
        return this._view;
    }

    public async doLogOut (authToken: AuthToken) {
        const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
    
        try {
          await this.logout(authToken!);
    
          this.view.deleteMessage(loggingOutToastId);
          this.view.clearUserInfo();
          this.view.navigate("/login");
        } catch (error) {
          this.view.displayErrorMessage(
            `Failed to log user out because of exception: ${error}`
          );
        }
      };
    
      public async logout (authToken: AuthToken): Promise<void> {
        // Pause so we can see the logging out message. Delete when the call to the server is implemented.
        // await new Promise((res) => setTimeout(res, 1000));
        return await this.UserService.logout(authToken);
      };
}   