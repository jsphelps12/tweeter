import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserItemView{
    addItems: (newItems: User[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
    
    private _view: UserItemView;
    private _hasMoreItems = true;
    private _lastItem: User | null = null;
    private userService: UserService;

    protected constructor(view: UserItemView){
        this._view = view;
        this.userService = new UserService();
    }

    protected get view() {
        return this._view;
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