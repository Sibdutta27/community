import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

// Create an S3 client with the specified configuration
export const createS3Client = (configService: ConfigService) => {
    return new S3Client({
        region        : configService.getOrThrow<string>('S3_REGION'),
        endpoint      : configService.getOrThrow<string>('S3_ENDPOINT'),
        forcePathStyle: !!configService.getOrThrow<string>('S3_ENDPOINT'),
        credentials   : {
            accessKeyId    : configService.getOrThrow<string>('S3_ACCESS_KEY'),
            secretAccessKey: configService.getOrThrow<string>('S3_SECRET_KEY'),
        },
    });
};