import { useContext } from "react";
import { AuthToken, User } from "tweeter-shared";
import { UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";
import { UserInfo } from "./UserInfo";

interface UserInfoActions {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void,
  clearUserInfo: () => void,
  setDisplayedUser: (user: User) => void,
}

export const useUserInfoActions = (): UserInfoActions => {
  const { updateUserInfo, clearUserInfo, setDisplayedUser } = useContext(UserInfoActionsContext);
  return { updateUserInfo: updateUserInfo, 
    clearUserInfo: clearUserInfo, 
    setDisplayedUser: setDisplayedUser };
}

export const useUserInfo = (): UserInfo => {
    return useContext(UserInfoContext);
}