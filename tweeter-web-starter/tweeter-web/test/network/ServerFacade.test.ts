import { ServerFacade } from "../../src/network/ServerFacade";
import { User, AuthToken } from "tweeter-shared";

/**
 * Integration tests for ServerFacade.
 * These tests make real HTTP calls to the deployed backend API.
 */
describe("ServerFacade Integration Tests", () => {
  let serverFacade: ServerFacade;
  let authToken: AuthToken;
  let testUser: User;

  beforeAll(async () => {
    serverFacade = new ServerFacade();
    
    // Login to get a valid auth token for subsequent tests
    // Using credentials from FakeData
    const loginRequest = {
      alias: "@allen",
      password: "password"
    };
    
    const [user, token] = await serverFacade.login(loginRequest);
    authToken = token;
    testUser = user;
  });

    /**
   * Test: Register a new user
   * 
   * Verifies that:
   * 1. A new user can be registered successfully
   * 2. The response includes a valid User object
   * 3. The response includes a valid AuthToken
   * 
   * NOTE: Currently using FakeData backend which returns hardcoded user (Allen Anderson)
   */
  describe("Register", () => {
    it("should successfully register a new user and return user and auth token", async () => {
      // Arrange
      const timestamp = Date.now();
      const registerRequest = {
        firstName: "Test",
        lastName: "User",
        alias: `@testuser${timestamp}`,  // Unique alias for each test run
        password: "password123",
        userImageBytes: "base64encodedimage",  // In real scenario, would be actual base64
        imageFileExtension: "png"
      };

      // Act
      const [user, token] = await serverFacade.register(registerRequest);

      // Assert
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
      // FakeData returns hardcoded user (Allen Anderson), not the requested user
      expect(user.firstName).toBe("Allen");
      expect(user.lastName).toBe("Anderson");
      expect(user.alias).toBe("@allen");
      expect(user.imageUrl).toBeDefined();

      expect(token).toBeDefined();
      expect(token).toBeInstanceOf(AuthToken);
      expect(token.token).toBeDefined();
      expect(token.token.length).toBeGreaterThan(0);
      expect(token.timestamp).toBeGreaterThan(0);
    });

    it("should handle registration request without throwing errors", async () => {
      // Arrange - even with existing alias, FakeData doesn't validate uniqueness
      const registerRequest = {
        firstName: "Duplicate",
        lastName: "User",
        alias: "@allen",  // Existing user from FakeData
        password: "password123",
        userImageBytes: "base64encodedimage",
        imageFileExtension: "png"
      };

      // Act
      const [user, token] = await serverFacade.register(registerRequest);

      // Assert - FakeData still returns a user (doesn't enforce uniqueness yet)
      expect(user).toBeDefined();
      expect(token).toBeDefined();
    });
  });

  /**
   * Test: Get Followers
   * 
   * Verifies that:
   * 1. A page of followers can be retrieved
   * 2. The response includes an array of User objects
   * 3. The response includes a hasMore flag
   * 4. The users in the response are valid User objects
   */
  describe("GetFollowers", () => {
    it("should successfully retrieve a page of followers", async () => {
      // Arrange
      const request = {
        token: authToken.token,
        userAlias: testUser.alias,
        pageSize: 10,
        lastItem: null  // First page
      };

      // Act
      const [followers, hasMore] = await serverFacade.getMoreFollowers(request);

      // Assert
      expect(followers).toBeDefined();
      expect(Array.isArray(followers)).toBe(true);
      expect(followers.length).toBeGreaterThan(0);
      expect(followers.length).toBeLessThanOrEqual(10);
      
      // Verify each follower is a valid User object
      followers.forEach(follower => {
        expect(follower).toBeInstanceOf(User);
        expect(follower.firstName).toBeDefined();
        expect(follower.lastName).toBeDefined();
        expect(follower.alias).toBeDefined();
        expect(follower.alias).toMatch(/^@/);  // Alias should start with @
        expect(follower.imageUrl).toBeDefined();
      });

      expect(typeof hasMore).toBe("boolean");
    });

    it("should retrieve subsequent pages of followers using lastItem", async () => {
      // Arrange - get first page
      const firstPageRequest = {
        token: authToken.token,
        userAlias: testUser.alias,
        pageSize: 5,
        lastItem: null
      };

      const [firstPageFollowers, hasMore] = await serverFacade.getMoreFollowers(firstPageRequest);
      
      // Only test pagination if there are more items
      if (hasMore) {
        const lastUserFromFirstPage = firstPageFollowers[firstPageFollowers.length - 1];

        const secondPageRequest = {
          token: authToken.token,
          userAlias: testUser.alias,
          pageSize: 5,
          lastItem: lastUserFromFirstPage.dto
        };

        // Act
        const [secondPageFollowers, hasMoreAfterSecondPage] = await serverFacade.getMoreFollowers(secondPageRequest);

        // Assert
        expect(secondPageFollowers).toBeDefined();
        expect(Array.isArray(secondPageFollowers)).toBe(true);
        expect(secondPageFollowers.length).toBeGreaterThan(0);
        
        // Ensure second page contains different users than first page
        const firstPageAliases = firstPageFollowers.map(f => f.alias);
        const secondPageAliases = secondPageFollowers.map(f => f.alias);
        
        secondPageAliases.forEach(alias => {
          expect(firstPageAliases).not.toContain(alias);
        });

        expect(typeof hasMoreAfterSecondPage).toBe("boolean");
      }
    });
  });

  /**
   * Test: Get Follower Count and Followee Count
   * 
   * Verifies that:
   * 1. Follower count can be retrieved and is a valid number
   * 2. Followee count can be retrieved and is a valid number
   * 3. Counts are non-negative
   */
  describe("GetFollowerCount and GetFolloweeCount", () => {
    it("should successfully retrieve follower count", async () => {
      // Arrange
      const request = {
        token: authToken.token,
        user: testUser.dto
      };

      // Act
      const followerCount = await serverFacade.getFollowerCount(request);

      // Assert
      expect(followerCount).toBeDefined();
      expect(typeof followerCount).toBe("number");
      expect(followerCount).toBeGreaterThanOrEqual(0);
    });

    it("should successfully retrieve followee count", async () => {
      // Arrange
      const request = {
        token: authToken.token,
        user: testUser.dto
      };

      // Act
      const followeeCount = await serverFacade.getFolloweeCount(request);

      // Assert
      expect(followeeCount).toBeDefined();
      expect(typeof followeeCount).toBe("number");
      expect(followeeCount).toBeGreaterThanOrEqual(0);
    });

    it("should retrieve valid counts (non-negative numbers)", async () => {
      // Arrange
      const request = {
        token: authToken.token,
        user: testUser.dto
      };

      // Act - call multiple times
      const followerCount1 = await serverFacade.getFollowerCount(request);
      const followerCount2 = await serverFacade.getFollowerCount(request);

      const followeeCount1 = await serverFacade.getFolloweeCount(request);
      const followeeCount2 = await serverFacade.getFolloweeCount(request);

      // Assert - FakeData returns random counts, so just verify they're valid numbers
      expect(followerCount1).toBeGreaterThanOrEqual(0);
      expect(followerCount2).toBeGreaterThanOrEqual(0);
      expect(followeeCount1).toBeGreaterThanOrEqual(0);
      expect(followeeCount2).toBeGreaterThanOrEqual(0);
      
      // Verify they're actual numbers, not null or undefined
      expect(typeof followerCount1).toBe("number");
      expect(typeof followerCount2).toBe("number");
      expect(typeof followeeCount1).toBe("number");
      expect(typeof followeeCount2).toBe("number");
    });
  });
});
