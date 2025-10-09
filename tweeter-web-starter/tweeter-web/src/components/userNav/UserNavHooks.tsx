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

    presenterRef.current!.navigateToUser(event, authToken!, displayedUser!, featurePath);

    // try {
    //   const alias = presenterRef.current!.extractAlias(event.target.toString());

    //   const toUser = await presenterRef.current!.getUser(authToken!, alias);

    //   if (toUser) {
    //     if (!toUser.equals(displayedUser!)) {
    //       setDisplayedUser(toUser);
    //       navigate(`${featurePath}/${toUser.alias}`);
    //     }
    //   }
    // } catch (error) {
    //   displayErrorMessage(
    //     `Failed to get user because of exception: ${error}`
    //   );
    // }
  };
  return navigateToUser;
}
