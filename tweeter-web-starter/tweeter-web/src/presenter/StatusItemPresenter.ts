import { AuthToken, Status } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface StatusItemView extends View{
    addItems: (newItems: Status[]) => void;
}

export abstract class StatusItemPresenter extends Presenter<StatusItemView>{
    private _hasMoreItems = true;
    private _lastItem: Status | null = null;
    private userService: UserService;


    protected constructor(view: StatusItemView){
        super(view);
        this.userService = new UserService();
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

    protected set lastItem(value: Status | null) {
        this._lastItem = value;
    }
    
    public async getUser(
        authToken: AuthToken,
        alias: string
      ): Promise<any>{
        return await this.userService.getUser(authToken, alias);
    }

    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
    
}