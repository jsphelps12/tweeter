import { NavigateFunction } from "react-router-dom";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";


export interface AppNavbarView extends MessageView{
    navigate: NavigateFunction;
    clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private _service: UserService
    
    constructor(view: AppNavbarView){
        super(view);
        this._service = new UserService();
    }

    public get service(): UserService {
        return this._service;
    }

    public async doLogOut (authToken: AuthToken) {
        await this.doFailureReportingOperation(async () => {
          const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
          await this.service.logout(authToken!);
    
          this.view.deleteMessage(loggingOutToastId);
          this.view.clearUserInfo();
          this.view.navigate("/login");
        }, "log user out");
    
      };
}   