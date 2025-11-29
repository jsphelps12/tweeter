/**
 * Database-agnostic interface for image storage operations (e.g., S3).
 */
export interface ImageDAO {
    /**
     * Uploads an image to storage.
     * @param fileName The name/key for the image file
     * @param imageStringBase64Encoded The image data as a base64 encoded string
     * @returns The URL where the image can be accessed
     */
    putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;

    /**
     * Deletes an image from storage.
     * @param fileName The name/key of the image file to delete
     */
    deleteImage(fileName: string): Promise<void>;

    /**
     * Gets the URL for an image.
     * @param fileName The name/key of the image file
     * @returns The URL where the image can be accessed
     */
    getImageUrl(fileName: string): string;
}
