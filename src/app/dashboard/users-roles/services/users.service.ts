import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ROLES_COLLECTION_NAME, USERS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { UserData, UserFirestore } from 'src/app/shared/models/user';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private router: Router
) { }

async newUserEmailAndPassword(user: UserData){
  const result = await this.auth.createUserWithEmailAndPassword(user.email, user.password);

  if (result.user) {
    await result.user.sendEmailVerification();
    await this.registerUserInFirestore(user, result.user.uid);
  } else {
    this.toastService.error('No se pudo obtener el usuario después del registro.')
  }
}

private async registerUserInFirestore(user: UserData, uid: string): Promise<void> {
const userFirestore: UserFirestore = {
  email: user.email,
  userName: user.userName,
  nickname: user.nickname,
  gender: user.gender,
  active: user.active,
  roleRef: this.dashboardService.getDocumentReference(ROLES_COLLECTION_NAME, user.roleRef)
};
  await this.firestore.collection(USERS_COLLECTION_NAME).doc(uid).set(userFirestore);
}

getUser(uid: string){ }

getUserLocal(){
  return this.auth.authState;
}

logout() {
  if (this.isAuthUser()){
    const success = this.auth.signOut()
    .then(() => this.router.navigate(['/']))
    .catch(error => console.log('Error al cerrar sesión:', error));
  }
  return this.auth.signOut();
}

isAuthUser(): Observable<boolean> {
  return this.auth.authState.pipe(
    map(user => !!user)
  );
}

}
