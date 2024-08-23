import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class FilterService {
    
    applyFilter($event: {
        searchValue: string;
        filters: any;
    }) {
        let filterObject: { [key: string]: any } = {};

        if ($event.searchValue?.trim()) {
            filterObject['searchString'] = $event.searchValue.trim().toLowerCase();
        }

        return JSON.stringify(filterObject);
    }
}