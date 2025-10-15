import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";
import { Service } from "../model.service/Service";

export const PAGE_SIZE = 10;

export interface PagedItemView<T>  extends View{
    addItems: (items: T[]) => void;
}

export abstract class PagedItemPresenter<T, U extends Service> extends Presenter<PagedItemView<T>>{
    private _hasMoreItems = true;
    private _lastItem: T | null = null;
    private _service: U;
    private userService = new UserService();

    public constructor(view: PagedItemView<T>) {
        super(view);
        this._service = this.serviceFactory();
    }

    protected abstract serviceFactory(): U;

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

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: T | null) {
        this._lastItem = value;
    }

    protected get service(): U {
        return this._service;
    }
    
    public async getUser(
        authToken: AuthToken,
        alias: string
        ): Promise<User | null>{
        return await this.userService.getUser(authToken, alias);
    }

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
          await this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.getMoreItemsImplementation(authToken, userAlias);
        
              this.hasMoreItems = hasMore;
              this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
              this.view.addItems(newItems);
            }, this.itemDescription());
          };

    protected abstract itemDescription(): string;

    protected abstract getMoreItemsImplementation(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;

}