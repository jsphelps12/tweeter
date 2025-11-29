import { ImageDAO } from "../interface/ImageDAO";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";

const BUCKET = "tweeter-profile-images-jsphelps12";
const REGION = "us-east-1";

export class S3ImageDAO implements ImageDAO {
    async putImage(
        fileName: string,
        imageStringBase64Encoded: string
    ): Promise<string> {
        let decodedImageBuffer: Buffer = Buffer.from(
            imageStringBase64Encoded,
            "base64"
        );
        const s3Params = {
            Bucket: BUCKET,
            Key: "image/" + fileName,
            Body: decodedImageBuffer,
            ContentType: "image/png",
            ACL: ObjectCannedACL.public_read,
        };
        const c = new PutObjectCommand(s3Params);
        const client = new S3Client({ region: REGION });
        try {
            await client.send(c);
            return (
                `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`
            );
        } catch (error) {
            throw Error("s3 put image failed with: " + error);
        }
    }

    async deleteImage(fileName: string): Promise<void> {
        const s3Params = {
            Bucket: BUCKET,
            Key: "image/" + fileName,
        };
        const c = new DeleteObjectCommand(s3Params);
        const client = new S3Client({ region: REGION });
        try {
            await client.send(c);
        } catch (error) {
            throw Error("s3 delete image failed with: " + error);
        }
    }

    getImageUrl(fileName: string): string {
        return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
    }
}
