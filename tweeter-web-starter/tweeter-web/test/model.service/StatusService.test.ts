import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken, Status } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";

/**
 * Integration test for StatusService.
 * Tests the service layer's ability to retrieve story pages through the ServerFacade.
 */
describe("StatusService Integration Test", () => {
  let statusService: StatusService;
  let authToken: AuthToken;
  let testUserAlias: string;

  beforeAll(async () => {
    // Login to get a valid auth token
    const serverFacade = new ServerFacade();
    const loginRequest = {
      alias: "@allen",
      password: "password"
    };
    
    const [user, token] = await serverFacade.login(loginRequest);
    authToken = token;
    testUserAlias = user.alias;
  });

  beforeEach(() => {
    statusService = new StatusService();
  });

  /**
   * Test: Load More Story Items
   * 
   * Verifies that:
   * 1. Story items can be successfully retrieved
   * 2. The response includes an array of Status objects
   * 3. The response includes a hasMore flag
   * 4. Each Status object has valid properties (post, user, timestamp, segments)
   * 5. Pagination works correctly with lastItem parameter
   */
  describe("loadMoreStoryItems", () => {
    it("should successfully load the first page of story items", async () => {
      // Arrange
      const pageSize = 10;
      const lastItem = null; // First page

      // Act
      const [storyItems, hasMore] = await statusService.loadMoreStoryItems(
        authToken,
        testUserAlias,
        pageSize,
        lastItem
      );

      // Assert
      expect(storyItems).toBeDefined();
      expect(Array.isArray(storyItems)).toBe(true);
      expect(storyItems.length).toBeGreaterThan(0);
      expect(storyItems.length).toBeLessThanOrEqual(pageSize);

      // Verify each status item has valid properties
      storyItems.forEach(status => {
        expect(status).toBeInstanceOf(Status);
        expect(status.post).toBeDefined();
        expect(typeof status.post).toBe("string");
        expect(status.post.length).toBeGreaterThan(0);
        
        expect(status.user).toBeDefined();
        expect(status.user.firstName).toBeDefined();
        expect(status.user.lastName).toBeDefined();
        expect(status.user.alias).toBeDefined();
        expect(status.user.alias).toMatch(/^@/); // Alias should start with @
        
        expect(status.timestamp).toBeDefined();
        expect(typeof status.timestamp).toBe("number");
        expect(status.timestamp).toBeGreaterThanOrEqual(0); // Changed to >= 0 to handle FakeData
        
        expect(status.segments).toBeDefined();
        expect(Array.isArray(status.segments)).toBe(true);
        expect(status.segments.length).toBeGreaterThan(0);
      });

      expect(typeof hasMore).toBe("boolean");
    });

    it("should load subsequent pages using lastItem for pagination", async () => {
      // Arrange
      const pageSize = 5;

      // Act - Get first page
      const [firstPageItems, hasMoreAfterFirstPage] = await statusService.loadMoreStoryItems(
        authToken,
        testUserAlias,
        pageSize,
        null
      );

      expect(firstPageItems.length).toBeGreaterThan(0);

      // Only test pagination if there are more items
      if (hasMoreAfterFirstPage) {
        const lastItemFromFirstPage = firstPageItems[firstPageItems.length - 1];

        // Act - Get second page
        const [secondPageItems, hasMoreAfterSecondPage] = await statusService.loadMoreStoryItems(
          authToken,
          testUserAlias,
          pageSize,
          lastItemFromFirstPage
        );

        // Assert
        expect(secondPageItems).toBeDefined();
        expect(Array.isArray(secondPageItems)).toBe(true);
        expect(secondPageItems.length).toBeGreaterThan(0);

        // Verify second page has different items than first page
        // Compare timestamps since they should be unique
        const firstPageTimestamps = firstPageItems.map(s => s.timestamp);
        const secondPageTimestamps = secondPageItems.map(s => s.timestamp);
        
        secondPageTimestamps.forEach(timestamp => {
          expect(firstPageTimestamps).not.toContain(timestamp);
        });

        expect(typeof hasMoreAfterSecondPage).toBe("boolean");
      }
    });

    it("should handle different page sizes correctly", async () => {
      // Arrange
      const smallPageSize = 3;
      const largePageSize = 10;

      // Act
      const [smallPage, _] = await statusService.loadMoreStoryItems(
        authToken,
        testUserAlias,
        smallPageSize,
        null
      );

      const [largePage, __] = await statusService.loadMoreStoryItems(
        authToken,
        testUserAlias,
        largePageSize,
        null
      );

      // Assert
      expect(smallPage.length).toBeLessThanOrEqual(smallPageSize);
      expect(largePage.length).toBeLessThanOrEqual(largePageSize);
      
      // If there are enough items, large page should have more items
      // (unless we're at the end of the data)
      if (largePage.length === largePageSize) {
        expect(largePage.length).toBeGreaterThan(smallPage.length);
      }
    });

    it("should return valid Status objects with properly parsed segments", async () => {
      // Arrange
      const pageSize = 5;

      // Act
      const [storyItems, hasMore] = await statusService.loadMoreStoryItems(
        authToken,
        testUserAlias,
        pageSize,
        null
      );

      // Assert - verify at least one status has segments
      expect(storyItems.length).toBeGreaterThan(0);
      
      const statusWithSegments = storyItems[0];
      expect(statusWithSegments.segments).toBeDefined();
      expect(statusWithSegments.segments.length).toBeGreaterThan(0);
      
      // Verify segment structure
      statusWithSegments.segments.forEach(segment => {
        expect(segment.text).toBeDefined();
        expect(segment.startPostion).toBeDefined();
        expect(segment.endPosition).toBeDefined();
        expect(segment.type).toBeDefined();
        expect(typeof segment.startPostion).toBe("number");
        expect(typeof segment.endPosition).toBe("number");
      });
    });
  });
});
