import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import {describe, it, expect, beforeEach} from '@jest/globals';
import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";


describe("PostStatusPresenter", () => {
    let mockPostStatusPresenterView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    const authToken = new AuthToken("token", Date.now());
    const post = "This is a test post";
    const user = new User("testuser", "Test", "User", "http://example.com/profile.jpg");
    const status = new Status(post, user, Date.now());
    let mockService: StatusService;
    beforeEach(() => {
        mockPostStatusPresenterView = mock<PostStatusView>()
        const mockPostStatusPresenterViewInstance = instance(mockPostStatusPresenterView);
        when(mockPostStatusPresenterView.displayInfoMessage(anything(), anything())).thenReturn("messageId123");

        const PostStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusPresenterViewInstance));
        postStatusPresenter = instance(PostStatusPresenterSpy);
        
        mockService = mock<StatusService>();

        when(PostStatusPresenterSpy.service).thenReturn(instance(mockService));
    })
    it("tells the view to display a posting status message", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);
        verify(mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)).once();
        
    }),
    it("calls postStatus on the post status service with the correct status string and auth token", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);
        verify(mockService.postStatus(authToken, anything())).once();

        const capturedArgs: any[] = capture(mockService.postStatus).first();

        const capturedAuthToken = capturedArgs[0] as AuthToken;
        const capturedStatus = capturedArgs[1] as Status;

        expect(capturedAuthToken).toBe(authToken);
        expect(capturedStatus.post).toBe(post);
        

    })
    it("tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);
        verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();
        verify(mockPostStatusPresenterView.setPost("")).once();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).once();

        verify(mockPostStatusPresenterView.displayErrorMessage(anything())).never();
    })
    it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message when unsuccessful", async () => {
        let error = new Error("An error occurred");
        when(mockService.postStatus(anything(), anything())).thenThrow(error);
        await postStatusPresenter.submitPost(post, user, authToken);

        verify(mockPostStatusPresenterView.displayErrorMessage("Failed to submit the post because of exception: An error occurred")).once();
        verify(mockPostStatusPresenterView.deleteMessage(anything())).once();
        verify(mockPostStatusPresenterView.setPost("")).never();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).never();
    })
})