import { NavigateFunction } from "react-router-dom";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";


export interface AppNavbarView extends MessageView{
    navigate: NavigateFunction;
    clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private UserService: UserService
    
    constructor(view: AppNavbarView){
        super(view);
        this.UserService = new UserService();
    }

    public async doLogOut (authToken: AuthToken) {
        const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
        this.doFailureReportingOperation(async () => {
          await this.UserService.logout(authToken!);
    
          this.view.deleteMessage(loggingOutToastId);
          this.view.clearUserInfo();
          this.view.navigate("/login");
        }, "log user out");
    
      //   try {
      //     await this.logout(authToken!);
    
      //     this.view.deleteMessage(loggingOutToastId);
      //     this.view.clearUserInfo();
      //     this.view.navigate("/login");
      //   } catch (error) {
      //     this.view.displayErrorMessage(
      //       `Failed to log user out because of exception: ${error}`
      //     );
      //   }
      };
    
      // public async logout (authToken: AuthToken): Promise<void> {
      //   // Pause so we can see the logging out message. Delete when the call to the server is implemented.
      //   // await new Promise((res) => setTimeout(res, 1000));
      //   return await this.UserService.logout(authToken);
      // };
}   