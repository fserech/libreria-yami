import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { CATEGORIES_COLLECTION_NAME } from "src/app/shared/constants/collections-name-firebase";
import { DashboardService } from "src/app/shared/services/dashboard/dashboard.service";

@Injectable({
  providedIn: 'root'
})
export class CategoriesResolver implements Resolve<any> {

    constructor(protected service: DashboardService) {}

    resolve(route: ActivatedRouteSnapshot): any {
        return this.service.getAllItemsCollection(CATEGORIES_COLLECTION_NAME, 'name');
    }

}
