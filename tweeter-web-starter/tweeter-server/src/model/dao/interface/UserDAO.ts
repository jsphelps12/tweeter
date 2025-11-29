/**
 * Database-agnostic interface for User data access operations.
 */
export interface UserDAO {
    /**
     * Stores a new user.
     * @param firstName The user's first name
     * @param lastName The user's last name
     * @param alias The user's unique alias
     * @param hashedPassword The hashed password for the user
     * @param imageUrl The URL where the user's profile image is stored
     */
    putUser(
        firstName: string,
        lastName: string,
        alias: string,
        hashedPassword: string,
        imageUrl: string
    ): Promise<void>;

    /**
     * Retrieves a user by their alias.
     * @param alias The user's alias
     * @returns The user data or null if not found
     */
    getUser(alias: string): Promise<{ firstName: string; lastName: string; alias: string; imageUrl: string } | null>;

    /**
     * Retrieves the hashed password for a user.
     * @param alias The user's alias
     * @returns The hashed password or null if user not found
     */
    getPasswordHash(alias: string): Promise<string | null>;

    /**
     * Updates a user's profile information.
     * @param alias The user's alias
     * @param firstName The updated first name (optional)
     * @param lastName The updated last name (optional)
     * @param imageUrl The updated image URL (optional)
     */
    updateUser(
        alias: string,
        firstName?: string,
        lastName?: string,
        imageUrl?: string
    ): Promise<void>;

    /**
     * Deletes a user from the database.
     * @param alias The alias of the user to delete
     */
    deleteUser(alias: string): Promise<void>;
}
