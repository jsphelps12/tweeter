import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { LoginView, LoginPresenter } from "../../../presenter/LoginPresenter";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: LoginView = {
      displayErrorMessage: displayErrorMessage,
      navigate: navigate,
      setIsLoading: setIsLoading,
      updateUserInfo: updateUserInfo
    }
  
  const presenterRef = useRef<LoginPresenter | null>(null);
      if (presenterRef.current === null) {
        presenterRef.current = new LoginPresenter(listener);
      }

  // const checkSubmitButtonStatus = (): boolean => {
  //   return presenterRef.current!.checkSubmitButtonStatus(alias, password);
  //   // return !alias || !password;
  // };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !presenterRef.current!.checkSubmitButtonStatus(alias, password)) {
      doLogin();
    }
  };

  const doLogin = async () => {
    presenterRef.current!.doLogin(alias, password, rememberMe, props.originalUrl!);
    // try {
    //   setIsLoading(true);

    //   const [user, authToken] = await presenterRef.current!.login(alias, password);

    //   updateUserInfo(user, user, authToken, rememberMe);

    //   if (!!props.originalUrl) {
    //     navigate(props.originalUrl);
    //   } else {
    //     navigate(`/feed/${user.alias}`);
    //   }
    // } catch (error) {
    //   displayErrorMessage(
    //     `Failed to log user in because of exception: ${error}`
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // const login = async (
  //   alias: string,
  //   password: string
  // ): Promise<[User, AuthToken]> => {
  //   // TODO: Replace with the result of calling the server
  //   const user = FakeData.instance.firstUser;

  //   if (user === null) {
  //     throw new Error("Invalid alias or password");
  //   }

  //   return [user, FakeData.instance.authToken];
  // };

  const inputFieldFactory = () => {
    return (
      <AuthenticationFields setAlias={setAlias} setPassword={setPassword} onKeyDown={loginOnEnter}/>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={()=>presenterRef.current!.checkSubmitButtonStatus(alias, password)}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
