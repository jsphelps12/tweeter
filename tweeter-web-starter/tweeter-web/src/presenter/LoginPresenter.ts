import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { Presenter, View } from "./Presenter";
import { AuthenticatorPresenter, AuthenticatorView } from "./AuthenticatorPresenter";
export class LoginPresenter extends AuthenticatorPresenter<AuthenticatorView> {

    private alias = "";
    private password = "";

    protected itemDescription(): string {
        return "log user in";
    }
    
    protected async performAuth(): Promise<[User, AuthToken]> {
        return this.userService.login(this.alias, this.password);   
    }

    public async doLogin (alias: string, password: string, rememberMe: boolean, originalUrl: string): Promise<void> {
        this.alias = alias;
        this.password = password;
        await this.doAuthAction(rememberMe, originalUrl);
    };

    public checkSubmitButtonStatus (alias: string, password: string): boolean {
        return !alias || !password;
    };
}