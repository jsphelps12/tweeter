import { AppNavbarPresenter, AppNavbarView } from "../../src/presenter/AppNavbarPresenter";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import {describe, it, expect, beforeEach} from '@jest/globals';
import { AuthToken } from "tweeter-shared";
import { UserService } from "../../src/model.service/UserService";


describe("AppNavbarPresenter", () => {
    let mockAppNavbarPresenterView: AppNavbarView;
    let appNavbarPresenter: AppNavbarPresenter;
    const authToken = new AuthToken("token", Date.now());
    let mockService: UserService;
    beforeEach(() => {
        mockAppNavbarPresenterView = mock<AppNavbarView>()
        const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);
        when(mockAppNavbarPresenterView.displayInfoMessage(anything(), anything())).thenReturn("messageId123");

        const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
        appNavbarPresenter = instance(appNavbarPresenterSpy);
        
        mockService = mock<UserService>();

        when(appNavbarPresenterSpy.service).thenReturn(instance(mockService));
    })
    it("tells the view to display a logging out message", async () => {
        await appNavbarPresenter.doLogOut(authToken);
        verify(mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)).once();
        
    }),
    it("calls logout on the user service with the correct auth token", async () => {
        await appNavbarPresenter.doLogOut(authToken);
        verify(mockService.logout(authToken)).once();

    })
    it("tells the view to clear the info message that was displayed previously, clears the user info, and navigates to the login page when successful", async () => {
        await appNavbarPresenter.doLogOut(authToken);
        verify(mockAppNavbarPresenterView.deleteMessage("messageId123")).once();
        verify(mockAppNavbarPresenterView.clearUserInfo()).once();
        verify(mockAppNavbarPresenterView.navigate("/login")).once();

        verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
    })
    it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful", async () => {
        let error = new Error("An error occurred");
        when(mockService.logout(anything())).thenThrow(error);
        await appNavbarPresenter.doLogOut(authToken);

        verify(mockAppNavbarPresenterView.displayErrorMessage("Failed to log user out because of exception: An error occurred")).once();
        verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();
        verify(mockAppNavbarPresenterView.clearUserInfo()).never();
        verify(mockAppNavbarPresenterView.navigate("/login")).never();
    })
})