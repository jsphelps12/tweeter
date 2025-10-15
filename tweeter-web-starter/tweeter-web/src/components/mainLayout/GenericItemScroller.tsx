import { Status, User } from "tweeter-shared";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import UserItem from "../userItem/UserItem";
import { UserItemPresenter } from "../../presenter/UserItemPresenter";
import { PagedItemPresenter, PagedItemView } from "../../presenter/PagedItemPresenter";

interface Props<T extends User | Status, P extends PagedItemPresenter<T, any>> {
    featureUrl: string;
    presenterFactory: (listener: PagedItemView<T>) => P;
    renderItem: (item: T, featureUrl: string) => React.JSX.Element;
}

const GenericItemScroller = <T extends User | Status, P extends PagedItemPresenter<T,any>>(props: Props<T,P>) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PagedItemView<T> = {
    addItems: (newItems: T[]) =>
    setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage
  }

  const presenterRef = useRef<P | null>(null);
  if (presenterRef.current === null) {
    presenterRef.current = props.presenterFactory(listener);
  }

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      presenterRef.current!.getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    presenterRef.current!.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={() => loadMoreItems()}
        hasMore={presenterRef.current!.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="row mb-3 mx-0 px-0 border rounded bg-white"
          >
            {props.renderItem(item, props.featureUrl)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default GenericItemScroller;
