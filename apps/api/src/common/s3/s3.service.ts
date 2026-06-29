import { Injectable } from "@nestjs/common";
import { PutObjectCommand, GetObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "@/config/s3.config";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3Service {

    private s3Client: S3Client;

    constructor(private configService: ConfigService) {
        // Initialize the S3 client using the configuration service
        this.s3Client = createS3Client(configService);
    }

    /**
     * Uploads a file to S3 and returns its details, including the URL and metadata.
     */
    async uploadFile(file: Express.Multer.File, folder: string, uname: string) {

        // Generate a unique key for the file in S3
        const key = `${folder}/${uname}`;

        const command = new PutObjectCommand({
            Bucket     : this.configService.getOrThrow<string>('S3_BUCKET'),
            Key        : key,
            Body       : file.buffer,
            ContentType: file.mimetype,
        });

        // Store the file in S3
        await this.s3Client.send(command);

        return {
            bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
            key   : key,
            url   : this.generateFileUrl(key),
            size  : file.size,
            type  : file.mimetype,
        };
    }

    /**
     * Deletes a file from S3 based on its key.
     * This is useful for removing files that are no longer needed or when a user requests deletion of their data.
     */
    async deleteFile(key: string) {

        const command = new DeleteObjectCommand({
            Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
            Key   : key,
        });

        await this.s3Client.send(command);
    }

    /**
     * Generates a signed URL for accessing a file in S3, allowing temporary access to the file without exposing it publicly.
     */
    async gets3SignedUrl(key: string) {

        const command = new GetObjectCommand({
            Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
            Key   : key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }

    /**
     * Generates a signed URL for accessing a file in S3, allowing temporary access to the file without exposing it publicly.
     */
    async gets3SignedPublicUrl(key: string) {

        const command = new GetObjectCommand({
            Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
            Key   : key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn: 604800 }); // 7 days
    }

    /**
     * Generates a public URL for a file stored in S3 based on the bucket, endpoint, and region configuration.
     * This URL can be used to access the file directly if it is publicly accessible.
     */
    private generateFileUrl(key: string): string {
        const bucket   = this.configService.getOrThrow<string>("S3_BUCKET");
        const endpoint = this.configService.getOrThrow<string>("S3_ENDPOINT");
        const region   = this.configService.getOrThrow<string>("S3_REGION");
        const provider = this.configService.getOrThrow<string>("S3_PROVIDER");

        // MinIO path-style
        if (provider === "minio") {
            return `${endpoint}/${bucket}/${key}`;
        }

        // Amazon S3 virtual-host-style
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
}