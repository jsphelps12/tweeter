import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavigateFunction } from "react-router-dom";
import { View, Presenter } from "./Presenter";

export interface UserNavView extends View{
    setDisplayedUser: (user: User) => void;
    navigate: NavigateFunction;
}

export class UserNavHooksPresenter extends Presenter<UserNavView> {
    private userService: UserService;
    
    constructor(view: UserNavView){
        super(view);
        this.userService = new UserService();
    }

    public extractAlias (value: string): string {
        const index = value.indexOf("@");
        return value.substring(index);
    };

    public async navigateToUser (event: string, authToken: AuthToken, displayedUser: User, featurePath: string): Promise<void> {
        await this.doFailureReportingOperation(async () => {
             const alias = this.extractAlias(event);

            const toUser = await this.userService.getUser(authToken, alias);

            if (toUser) {
                if (!toUser.equals(displayedUser!)) {
                this.view.setDisplayedUser(toUser);
                this.view.navigate(`${featurePath}/${toUser.alias}`);
                }
            }
        }, "navigate to user");

    };


}