import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";


export interface LoginView {
  // Methods to be implemented by the view (e.g., a React component)
  displayErrorMessage: (message: string) => void;
  navigate: NavigateFunction;
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (loggedInUser: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
}

export class LoginPresenter {
    // Implementation not shown as it's not part of the comparison
    private userService: UserService;
    private _view: LoginView;
    
    constructor(view: LoginView) {
        this.userService = new UserService();
        this._view = view;
    }

    public get view() {
        return this._view;
    }

    public async login (
        alias: string,
        password: string
      ): Promise<[User, AuthToken]> {
        // TODO: Replace with the result of calling the server
        return await this.userService.login(alias, password);
      };

    public async doLogin (alias: string, password: string, rememberMe: boolean, originalUrl: string): Promise<void> {
        try {
        this.view.setIsLoading(true);

        const [user, authToken] = await this.login(alias, password);

        this.view.updateUserInfo(user, user, authToken, rememberMe);

        if (!!originalUrl) {
            this.view.navigate(originalUrl);
        } else {
            this.view.navigate(`/feed/${user.alias}`);
        }
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to log user in because of exception: ${error}`
        );
        } finally {
        this.view.setIsLoading(false);
        }
    };

    public checkSubmitButtonStatus (alias: string, password: string): boolean {
        return !alias || !password;
    };
}