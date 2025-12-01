import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { UserNavHooksPresenter, UserNavView } from "../../presenter/UserNavHooksPresenter";
import { useRef } from "react";

export const useUserNavigation = (featurePath: string) => {
  const { updateUserInfo, setDisplayedUser } = useUserInfoActions();
  const { displayedUser, currentUser, authToken } = useUserInfo();
  const { displayErrorMessage } = useMessageActions();
  const navigate = useNavigate();

  const listener: UserNavView = {
      displayErrorMessage: displayErrorMessage, 
      setDisplayedUser: setDisplayedUser, 
      navigate: navigate
    }
  
  const presenterRef = useRef<UserNavHooksPresenter | null>(null);
      if (presenterRef.current === null) {
        presenterRef.current = new UserNavHooksPresenter(listener);
      }

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

    presenterRef.current!.navigateToUser(event.target.toString(), authToken!, displayedUser!, featurePath);

  };
  return navigateToUser;
}
