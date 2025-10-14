import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { Presenter, View } from "./Presenter";


export interface LoginView extends View{
  // Methods to be implemented by the view (e.g., a React component)
  navigate: NavigateFunction;
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (loggedInUser: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
}

export class LoginPresenter extends Presenter<LoginView> {
    // Implementation not shown as it's not part of the comparison
    private userService: UserService;
    
    constructor(view: LoginView) {
        super(view);
        this.userService = new UserService();
    }

    public async doLogin (alias: string, password: string, rememberMe: boolean, originalUrl: string): Promise<void> {
        await this.doFailureReportingOperation(async () => {
            const [user, authToken] = await this.userService.login(alias, password);

            this.view.updateUserInfo(user, user, authToken, rememberMe);

            if (!!originalUrl) {
                this.view.navigate(originalUrl);
            } else {
                this.view.navigate(`/feed/${user.alias}`);
            }
        }, "log user in");
        // try {
        // // this.view.setIsLoading(true);

        // const [user, authToken] = await this.userService.login(alias, password);

        // this.view.updateUserInfo(user, user, authToken, rememberMe);

        // if (!!originalUrl) {
        //     this.view.navigate(originalUrl);
        // } else {
        //     this.view.navigate(`/feed/${user.alias}`);
        // }
        // } catch (error) {
        // this.view.displayErrorMessage(
        //     `Failed to log user in because of exception: ${error}`
        // );
        // // } finally {
        // // this.view.setIsLoading(false);
        // }
    };

    public checkSubmitButtonStatus (alias: string, password: string): boolean {
        return !alias || !password;
    };
}