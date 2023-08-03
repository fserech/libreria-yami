import { UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export interface DirtyGuard {
    isDirty: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
}
