import { describe, it, expect, beforeAll } from '@jest/globals';
import { AuthToken, User } from 'tweeter-shared';
import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';
import { ServerFacade } from '../../src/network/ServerFacade';
import { instance, mock, verify } from '@typestrong/ts-mockito';

/**
 * Integration test to verify that when a user sends a status,
 * the status is correctly appended to the user's story.
 */
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
        
        // Step 1: Login a user
        const [loggedInUser, token] = await serverFacade.login({
            alias: "user1",
            password: "user1"
        });

        user = loggedInUser;
        authToken = token;

        // Setup mock view for presenter
        mockView = mock<PostStatusView>();
        const mockViewInstance = instance(mockView);
        postStatusPresenter = new PostStatusPresenter(mockViewInstance);
    });

    it("should post a status and verify it appears in the user's story", async () => {
        // Step 2: Post a status from the user
        await postStatusPresenter.submitPost(testPost, user, authToken);

        // Step 3: Verify "Successfully Posted!" message was displayed
        verify(mockView.displayInfoMessage("Status posted!", 2000)).once();

        // Wait a moment for the status to be written to the story table
        // (The write happens synchronously, but we give it a small buffer)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 4: Retrieve the user's story and verify the new status is there
        const [items, hasMore] = await serverFacade.getMoreStoryItems({
            token: authToken.token,
            userAlias: user.alias,
            pageSize: 10,
            lastItem: null
        });

        expect(items).toBeDefined();
        expect(items.length).toBeGreaterThan(0);

        // Find the status we just posted (should be the first one since it's most recent)
        const postedStatus = items[0];
        
        // Verify all status details are correct
        expect(postedStatus.post).toBe(testPost);
        expect(postedStatus.user.alias).toBe(user.alias);
        expect(postedStatus.user.firstName).toBe(user.firstName);
        expect(postedStatus.user.lastName).toBe(user.lastName);
        expect(postedStatus.timestamp).toBeDefined();
        
        // Verify timestamp is recent (within last 10 seconds)
        const timeDiff = Date.now() - postedStatus.timestamp;
        expect(timeDiff).toBeLessThan(10000);
    });
});
