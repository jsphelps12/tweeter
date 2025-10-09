import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";

export interface UserNavView{
    setDisplayedUser: (user: User) => void;
    displayErrorMessage: (message: string) => void;
    navigate: NavigateFunction;
}

export class UserNavHooksPresenter {
    private userService: UserService;
    private _view: UserNavView;
    
    constructor(view: UserNavView){
        this.userService = new UserService();
        this._view = view;
    }


    public async getUser (
        authToken: AuthToken,
        alias: string
        ): Promise<User | null> {
        return this.userService.getUser(authToken, alias);
        };

    public extractAlias (value: string): string {
        const index = value.indexOf("@");
        return value.substring(index);
    };

    public async navigateToUser (event: string, authToken: AuthToken, displayedUser: User, featurePath: string): Promise<void> {

        try {
        const alias = this.extractAlias(event);

        const toUser = await this.getUser(authToken, alias);

        if (toUser) {
            if (!toUser.equals(displayedUser!)) {
            this._view.setDisplayedUser(toUser);
            this._view.navigate(`${featurePath}/${toUser.alias}`);
            }
        }
        } catch (error) {
        this._view.displayErrorMessage(
            `Failed to get user because of exception: ${error}`
        );
        }
    };


}