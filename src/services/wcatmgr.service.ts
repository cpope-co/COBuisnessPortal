import { Injectable, inject } from "@angular/core";
import { environment } from "../environments/environment";
import { GetWCatMgrResponse } from "../models/get-wcatmgr.response";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";


@Injectable({
    providedIn: 'root'
})
export class WCatMgrService {
    env = environment;

    http = inject(HttpClient);

    async loadAllWCatMgrs() {
        const wcatmgrs$ = this.http.get<GetWCatMgrResponse>(`${this.env.apiBaseUrl}/register`);

        const response = await firstValueFrom(wcatmgrs$);
        
        return response.wcatmgr;
    }
}