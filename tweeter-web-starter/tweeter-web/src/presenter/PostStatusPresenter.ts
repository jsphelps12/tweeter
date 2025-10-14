import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView{
    setIsLoading: (isLoading: boolean) => void;
    setPost: (post: string) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
    private statusService: StatusService;
    
    constructor(view: PostStatusView){
        super(view);
        this.statusService = new StatusService();
    }

    public checkButtonStatus(post: string, authToken: AuthToken, currentUser: User): boolean {
        return !post.trim() || !authToken || !currentUser;
    };

    // public async postStatus  (
    //     authToken: AuthToken,
    //     newStatus: Status
    //     ): Promise<void> {
    //         // Pause so we can see the logging out message. Remove when connected to the server
    //         await this.statusService.postStatus(authToken, newStatus);

    //         // TODO: Call the server to post the status
    //     };

    public async submitPost  (post: string, currentUser: User, authToken: AuthToken) {
        var postingStatusToastId = "";
        await this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);
            postingStatusToastId = this.view.displayInfoMessage(
                "Posting status...",
                0
            );

            const status = new Status(post, currentUser!, Date.now());

            await this.statusService.postStatus(authToken!, status);

            this.view.setPost("");
            this.view.displayInfoMessage("Status posted!", 2000);
        }, "submit the post");
        // var postingStatusToastId = "";

        // try {
        // this.view.setIsLoading(true);
        // postingStatusToastId = this.view.displayInfoMessage(
        //     "Posting status...",
        //     0
        // );

        // const status = new Status(post, currentUser!, Date.now());

        // await this.statusService.postStatus(authToken!, status);

        // this.view.setPost("");
        // this.view.displayInfoMessage("Status posted!", 2000);
        // } catch (error) {
        // this.view.displayErrorMessage(
        //     `Failed to post the status because of exception: ${error}`
        // );
        // } finally {
        this.view.deleteMessage(postingStatusToastId);
        this.view.setIsLoading(false);
        // }
    };
                      
}