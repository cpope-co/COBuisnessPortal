export type User = {
    sub: number;
    name: string;
    roles: number[];
    exp: EpochTimeStamp;
    iat: EpochTimeStamp;
    refexp: EpochTimeStamp;
}