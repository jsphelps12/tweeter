import "./PostStatus.css";
import { useRef, useState } from "react";
import { AuthToken, Status } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserInfoHooks";
import { PostStatusPresenter, PostStatusView } from "../../presenter/PostStatusPresenter";

interface Props {
  presenter?: PostStatusPresenter;
}

const PostStatus = (props: Props) => {
  const { displayInfoMessage, displayErrorMessage, deleteMessage } = useMessageActions();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const listener: PostStatusView = {
      setIsLoading: setIsLoading,
      setPost: setPost,
      displayInfoMessage: displayInfoMessage,
      deleteMessage: deleteMessage,
      displayErrorMessage: displayErrorMessage
    }
  
  const presenterRef = useRef<PostStatusPresenter | null>(null);
      if (presenterRef.current === null) {
        presenterRef.current = props.presenter ?? new PostStatusPresenter(listener);
      }

  const submitPost = async (event: React.MouseEvent) => {
    event.preventDefault();

    presenterRef.current!.submitPost(post, currentUser!, authToken!);

    // var postingStatusToastId = "";

    // try {
    //   setIsLoading(true);
    //   postingStatusToastId = displayInfoMessage(
    //     "Posting status...",
    //     0
    //   );

    //   const status = new Status(post, currentUser!, Date.now());

    //   await postStatus(authToken!, status);

    //   setPost("");
    //   displayInfoMessage("Status posted!", 2000);
    // } catch (error) {
    //   displayErrorMessage(
    //     `Failed to post the status because of exception: ${error}`
    //   );
    // } finally {
    //   deleteMessage(postingStatusToastId);
    //   setIsLoading(false);
    // }
  };

  // const postStatus = async (
  //   authToken: AuthToken,
  //   newStatus: Status
  // ): Promise<void> => {
  //   // Pause so we can see the logging out message. Remove when connected to the server
  //   await new Promise((f) => setTimeout(f, 2000));

  //   // TODO: Call the server to post the status
  // };

  const clearPost = (event: React.MouseEvent) => {
    event.preventDefault();
    setPost("");
  };

  // const checkButtonStatus: () => boolean = () => {
  //   return !post.trim() || !authToken || !currentUser;
  // };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          aria-label="post"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          
          // disabled={checkButtonStatus()}
          disabled = {presenterRef.current!.checkButtonStatus(post, authToken!, currentUser!)}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          disabled={presenterRef.current!.checkButtonStatus(post, authToken!, currentUser!)}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
