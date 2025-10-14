import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface UserItemView extends View {
    addItems: (newItems: User[]) => void;
}

export abstract class UserItemPresenter extends Presenter<UserItemView> {
    
    private _hasMoreItems = true;
    private _lastItem: User | null = null;
    private userService = new UserService();

    protected constructor(view: UserItemView){
        super(view);
    }

    reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }

    public get hasMoreItems() {
        return this._hasMoreItems;
    }

    protected set hasMoreItems(value: boolean) {
        this._hasMoreItems = value;
    }

    public get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: User | null) {
        this._lastItem = value;
    }
    
    public async getUser(
        authToken: AuthToken,
        alias: string
      ): Promise<User | null>{
        return await this.userService.getUser(authToken, alias);
    }

    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
    
}