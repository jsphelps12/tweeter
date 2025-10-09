import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";

export interface PostStatusView{
    setIsLoading: (isLoading: boolean) => void;
    setPost: (post: string) => void;
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (id: string) => void;
    displayErrorMessage: (message: string) => void;
}

export class PostStatusPresenter {
    private statusService: StatusService;
    private _view: PostStatusView;
    
    constructor(view: PostStatusView){
        this._view = view;
        this.statusService = new StatusService();
    }

    public get view() {
        return this._view;
    }

    public checkButtonStatus(post: string, authToken: AuthToken, currentUser: User): boolean {
        return !post.trim() || !authToken || !currentUser;
    };

    public async postStatus  (
        authToken: AuthToken,
        newStatus: Status
        ): Promise<void> {
            // Pause so we can see the logging out message. Remove when connected to the server
            await this.statusService.postStatus(authToken, newStatus);

            // TODO: Call the server to post the status
        };

    public async submitPost  (post: string, currentUser: User, authToken: AuthToken) {
        var postingStatusToastId = "";

        try {
        this.view.setIsLoading(true);
        postingStatusToastId = this.view.displayInfoMessage(
            "Posting status...",
            0
        );

        const status = new Status(post, currentUser!, Date.now());

        await this.postStatus(authToken!, status);

        this.view.setPost("");
        this.view.displayInfoMessage("Status posted!", 2000);
        } catch (error) {
        this.view.displayErrorMessage(
            `Failed to post the status because of exception: ${error}`
        );
        } finally {
        this.view.deleteMessage(postingStatusToastId);
        this.view.setIsLoading(false);
        }
    };
                      
}