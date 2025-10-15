import { NavigateFunction } from "react-router-dom";
import { User, AuthToken } from "tweeter-shared";
import { View, Presenter } from "./Presenter";
import { UserService } from "../model.service/UserService";

export interface AuthenticatorView extends View{
    navigate: NavigateFunction;
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (loggedInUser: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;

  }


export abstract class AuthenticatorPresenter<T extends AuthenticatorView> extends Presenter<T> {

    userService: UserService = new UserService();
    
    public constructor(view: T) {
        super(view);
    }

    // public async doAuthAction (...args: any[]): Promise<void> {
    //     await this.doFailureReportingOperation(async () => {
    //         const [user, authToken] = await this.performAuth(...args);

    //         this.view.updateUserInfo(user, user, authToken, rememberMe);

    //         this.doNav(user, args[args.length - 1]); // originalUrl is the last argument
    //     }, this.itemDescription());
    // };
    public async doAuthAction(rememberMe: boolean, originalUrl?: string): Promise<void> {
        await this.doFailureReportingOperation(async () => {
        this.view.setIsLoading(true);

        const [user, authToken] = await this.performAuth();

        // common post-success behavior
        this.view.updateUserInfo(user, user, authToken, rememberMe);

        if (originalUrl && originalUrl.length > 0) {
            this.view.navigate(originalUrl);
        } else {
            this.view.navigate(`/feed/${user.alias}`);
        }
        }, "authenticate user").finally(() => {
        // ensure loading cleared regardless of success/error
        this.view.setIsLoading(false);
        });
    }

    protected abstract itemDescription(): string;

    protected abstract performAuth(...args: any[]): Promise<[User, AuthToken]>;

    public abstract checkSubmitButtonStatus (...args: any[]): boolean;


}