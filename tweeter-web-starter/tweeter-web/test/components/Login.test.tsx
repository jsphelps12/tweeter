/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";

import Login from "../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import userEvent from "@testing-library/user-event";
import { LoginPresenter } from "../../src/presenter/LoginPresenter";
import { instance, mock, verify } from "@typestrong/ts-mockito";

library.add(fab);

describe("Login Component", () => {
  it("starts with the sign in button disabled", () => {
    const { signInButton } = renderLoginAndGetElement("/");
    expect(signInButton).toBeDisabled();
  })
  it("enables the sign in button when both alias and password are filled", async () => {
    const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/");

    await user.type(aliasField, "a");
    await user.type(passwordField, "b");
    expect(signInButton).toBeEnabled();
  })
  it("keeps the sign in button disabled when only alias or password is filled", async () => {
    const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/");

    await user.type(aliasField, "a");
    expect(signInButton).toBeDisabled();
    await user.clear(aliasField);
    await user.type(passwordField, "b");
    expect(signInButton).toBeDisabled();
  })
  it("ensures the presenter's login method is called with correct parameters when the sign-in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const originalUrl = "http://test.com";
    
    const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement(originalUrl, mockPresenterInstance);

    
    const alias = "abc";
    const password = "123";
    await user.type(aliasField, alias);
    await user.type(passwordField, password);
    await user.click(signInButton);

    verify(mockPresenter.doLogin(alias, password, false, originalUrl)).once();
  })
})

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (<Login originalUrl={originalUrl} presenter={presenter}/>) : (<Login originalUrl={originalUrl} />) }
    </MemoryRouter>
  );
}

function renderLoginAndGetElement(originalUrl: string, presenter?: LoginPresenter) {
    const user = userEvent.setup();
    renderLogin(originalUrl, presenter);

    const signInButton = screen.getByRole("button", { name: /Sign In/i});
    const aliasField = screen.getByLabelText("alias");
    const passwordField = screen.getByLabelText("password");

    return { user, signInButton, aliasField, passwordField };
}
