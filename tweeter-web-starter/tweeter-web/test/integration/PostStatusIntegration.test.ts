import { describe, it, expect, beforeAll } from '@jest/globals';
import { AuthToken, User } from 'tweeter-shared';
import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';
import { ServerFacade } from '../../src/network/ServerFacade';
import { instance, mock, verify } from '@typestrong/ts-mockito';

describe("Post Status Integration Test", () => {
    let authToken: AuthToken;
    let user: User;
    let serverFacade: ServerFacade;
    let postStatusPresenter: PostStatusPresenter;
    let mockView: PostStatusView;
    const timestamp = Date.now();
    const testPost = `Integration test post at ${timestamp}`;

    beforeAll(async () => {
        serverFacade = new ServerFacade();
        
        const [loggedInUser, token] = await serverFacade.login({
            alias: "user1",
            password: "user1"
        });

        user = loggedInUser;
        authToken = token;

        mockView = mock<PostStatusView>();
        const mockViewInstance = instance(mockView);
        postStatusPresenter = new PostStatusPresenter(mockViewInstance);
    });

    it("should post a status and verify it appears in the user's story", async () => {
        await postStatusPresenter.submitPost(testPost, user, authToken);

        verify(mockView.displayInfoMessage("Status posted!", 2000)).once();

        await new Promise(resolve => setTimeout(resolve, 500));

        const [items, hasMore] = await serverFacade.getMoreStoryItems({
            token: authToken.token,
            userAlias: user.alias,
            pageSize: 10,
            lastItem: null
        });

        expect(items).toBeDefined();
        expect(items.length).toBeGreaterThan(0);

        const postedStatus = items[0];
        
        expect(postedStatus.post).toBe(testPost);
        expect(postedStatus.user.alias).toBe(user.alias);
        expect(postedStatus.user.firstName).toBe(user.firstName);
        expect(postedStatus.user.lastName).toBe(user.lastName);
        expect(postedStatus.timestamp).toBeDefined();
        
        const timeDiff = Date.now() - postedStatus.timestamp;
        expect(timeDiff).toBeLessThan(10000);
    });
});
