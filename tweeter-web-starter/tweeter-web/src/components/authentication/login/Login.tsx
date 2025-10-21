import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { LoginPresenter } from "../../../presenter/LoginPresenter";
import { AuthenticatorView } from "../../../presenter/AuthenticatorPresenter";

interface Props {
  originalUrl?: string;
  presenter?: LoginPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: AuthenticatorView = {
      displayErrorMessage: displayErrorMessage,
      navigate: navigate,
      setIsLoading: setIsLoading,
      updateUserInfo: updateUserInfo
    }
  
  const presenterRef = useRef<LoginPresenter | null>(null);
      if (presenterRef.current === null) {
        presenterRef.current = props.presenter ?? new LoginPresenter(listener);
      }

    useEffect(() => {
      presenterRef.current = props.presenter ?? new LoginPresenter(listener);
    }, [rememberMe]);

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !presenterRef.current!.checkSubmitButtonStatus(alias, password)) {
      doLogin();
    }
  };

  const doLogin = async () => {

    setIsLoading(true);
    presenterRef.current!.doLogin(alias, password, rememberMe, props.originalUrl!);

    setIsLoading(false);

  };

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
