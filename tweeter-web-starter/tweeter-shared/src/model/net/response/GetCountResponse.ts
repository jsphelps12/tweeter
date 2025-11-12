import { TweeterResponse } from "./TweeterResponse";

export interface GetCountResponse extends TweeterResponse {
    readonly count: number
}