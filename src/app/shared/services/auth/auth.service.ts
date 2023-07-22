import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAuth } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore) { }

  login(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  isAuth() {
    return this.afAuth.authState.pipe(map( User => User != null ));
  }

  currentUser() {
    return this.afAuth.user;
  }

  currentUserData() {
    const auth = getAuth();
    const user = auth.currentUser;
    return user;
  }


  logout() {
    if (this.isAuthUser()){
      const success = this.afAuth.signOut()
      .then(() => this.router.navigate(['/autenticacion']))
      .catch(error => console.log('Error al cerrar sesión:', error));
    }
  }

  isAuthUser(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }
}
