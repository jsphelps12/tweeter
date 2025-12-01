export interface ImageDAO {
    
    putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;

    deleteImage(fileName: string): Promise<void>;

    getImageUrl(fileName: string): string;
}
