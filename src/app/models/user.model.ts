export type User = {
    sub: number;
    name: string;
    role: number;
    exp: EpochTimeStamp;
    iat: EpochTimeStamp;
    refexp: EpochTimeStamp;
    fpc: boolean;
}