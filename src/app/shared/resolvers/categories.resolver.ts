<<<<<<< HEAD:src/app/shared/resolvers/categories.resolver.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { CATEGORIES_COLLECTION_NAME} from 'src/app/shared/constants/collections-name-firebase';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
=======
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { CATEGORIES_COLLECTION_NAME } from "src/app/shared/constants/collections-name-firebase";
import { DashboardService } from "src/app/shared/services/dashboard/dashboard.service";
>>>>>>> f2e000eaefe62608e49d4bdd1fb9bcc53ab88623:src/app/dashboard/brands/resolvers/categories.resolver.ts

@Injectable({
  providedIn: 'root'
})
export class CategoriesResolver implements Resolve<any> {

    constructor(protected service: DashboardService) {}

    resolve(route: ActivatedRouteSnapshot): any {
        return this.service.getAllItemsCollection(CATEGORIES_COLLECTION_NAME, 'name');
    }

}
