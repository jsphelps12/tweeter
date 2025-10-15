import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import GenericItemScroller from "./components/mainLayout/GenericItemScroller";
import { useCallback } from "react";
import StatusItem from "./components/statusItem/StatusItem";
import UserItem from "./components/userItem/UserItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const renderUserItem = useCallback((item: User, featureUrl: string) => {
    return <UserItem user={item} featurePath={featureUrl} />;
  }, []);

  const renderStatusItem = useCallback((item: Status, featureUrl: string) => {
    return <StatusItem status={item} featurePath={featureUrl} />;
  }, []);



  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route path="feed/:displayedUser" 
          element={<GenericItemScroller<Status, FeedPresenter>
            key = {`feed-${displayedUser!.alias}`} 
            featureUrl="/feed" 
            presenterFactory={(view: PagedItemView<Status>) => new FeedPresenter(view)}
            renderItem={renderStatusItem}/> } />
        <Route path="story/:displayedUser" 
          element={<GenericItemScroller<Status, StoryPresenter>
            key = {`story-${displayedUser!.alias}`} 
            featureUrl="/story" 
            presenterFactory={(view: PagedItemView<Status>) => new StoryPresenter(view)}
            renderItem={renderStatusItem}/>} />
        <Route path="followees/:displayedUser" 
          element={<GenericItemScroller<User, FolloweePresenter> 
            key = {`followees-${displayedUser!.alias}`} 
            featureUrl="/followees" 
            presenterFactory={(view: PagedItemView<User>) => new FolloweePresenter(view)}
            renderItem = {renderUserItem}/>} />
        <Route path="followers/:displayedUser" 
          element={<GenericItemScroller< User, FollowerPresenter>
            key = {`followers-${displayedUser!.alias}`}  
            featureUrl="/followers" 
            presenterFactory={(view: PagedItemView<User>) => new FollowerPresenter(view)}
            renderItem = {renderUserItem}/>} />
        <Route path="logout" 
          element={<Navigate to="/login" />} />
        <Route path="*" 
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
