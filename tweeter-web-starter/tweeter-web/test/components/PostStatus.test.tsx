import "@testing-library/jest-dom";

import PostStatus from "../../src/components/postStatus/PostStatus";
import { PostStatusPresenter } from "../../src/presenter/PostStatusPresenter";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import userEvent from "@testing-library/user-event";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { useUserInfo } from "../../src/components/userInfo/UserInfoHooks";
import { AuthToken, User } from "tweeter-shared";

library.add(fab);

jest.mock("../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));  

describe("PostStatus Component", () => {
  const mockUserInstance = mock(User);
  const mockAuthTokenInstance = mock(AuthToken);
  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
    currentUser: mockUserInstance,
    authToken: mockAuthTokenInstance,
    });
});    
  it("starts with the post and clear buttons disabled", () => {
    const { postButton, clearButton } = renderPostStatusAndGetElement();
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  })
  it("enables both buttons when the text field has test", async () => {
    const {postButton, clearButton, postField, user} = renderPostStatusAndGetElement();

    await user.type(postField, "Hello world!");
    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
    
  })
  it("Both buttons are disabled when the text field is cleared", async () => {
    const {postButton, clearButton, postField, user} = renderPostStatusAndGetElement();

    await user.type(postField, "Hello world!");
    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(postField);
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    
  })
  it("presenter's postStatus method is called with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);
    
    const {postButton, postField, user} = renderPostStatusAndGetElement(mockPresenterInstance);

    const postContent = "This is a test post.";
    await user.type(postField, postContent);
    await user.click(postButton);

    verify(mockPresenter.submitPost(postContent, mockUserInstance, mockAuthTokenInstance)).once();
    
  })
})

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (<PostStatus  presenter={presenter}/>) : (<PostStatus />) }
    </MemoryRouter>
  );
}

function renderPostStatusAndGetElement(presenter?: PostStatusPresenter) {
    const user = userEvent.setup();
    renderPostStatus(presenter);

    const postButton = screen.getByRole("button", { name: /Post Status/i });
    const clearButton = screen.getByRole("button", { name: /Clear/i });
    const postField = screen.getByLabelText("post");

    return {postButton, clearButton, postField, user};

}   