import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class Step3Dto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    culturalConnectionKeys: string[];
}