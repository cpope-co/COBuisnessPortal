import { Injectable, effect, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { GetWCatMgrResponse } from "../models/get-wcatmgr.response";
import { firstValueFrom } from "rxjs";
import { HttpClient, HttpContext } from "@angular/common/http";
import { WCatMgr } from "../models/wcatmgr.model";
import { SKIP_REFRESH_KEY, SKIP_AUTH_KEY } from "../shared/http-context-keys";


@Injectable({
    providedIn: 'root'
})
export class WCatMgrService {
    env = environment;

    http = inject(HttpClient);
    #wcatmgrsSignal = signal<WCatMgr[]>([]);
    wcatmgrs = this.#wcatmgrsSignal.asReadonly();

    constructor() {
        effect(() => {
            const wcatmgr = this.wcatmgrs();
            if (wcatmgr) {
                localStorage.setItem('wcatmgr', JSON.stringify(wcatmgr));
            }
        });
    }
    async loadAllWCatMgrs() {
        let wcatmgr = localStorage.getItem('wcatmgr');
        if (!wcatmgr || wcatmgr === '[]') {
            const context = new HttpContext().set(SKIP_REFRESH_KEY, true).set(SKIP_AUTH_KEY, true);

            const wcatmgrs$ = this.http.get<GetWCatMgrResponse>(`${this.env.apiBaseUrl}/register`, { context });
            const response = await firstValueFrom(wcatmgrs$);
            this.#wcatmgrsSignal.set(response.wcatmgr);
            wcatmgr = JSON.stringify(response.wcatmgr);
            localStorage.setItem('wcatmgr', wcatmgr);
        }
        return JSON.parse(wcatmgr) as WCatMgr[];
    }
}