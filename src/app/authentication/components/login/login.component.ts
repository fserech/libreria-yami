import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { fadeInOutAnimation } from 'src/app/shared/animations/fade-in-out.animation';
import { BaseForm } from 'src/app/shared/classes/base-form';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { USERS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { UserData, UserFirestore } from 'src/app/shared/models/user';
import { Role } from 'src/app/dashboard/users-roles/models/role';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [ fadeInOutAnimation ]
})
export class LoginComponent extends BaseForm  implements OnInit {

  hidePassword = true;

  constructor(
    protected formBuilder: FormBuilder,
    private route: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private dashboardService: DashboardService) {
      super(formBuilder)
    }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  protected getFields(): FormGroup {
    let form: FormGroup;
    return form;
  }

  isDirty(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return true;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  login() {
    if (this.form.valid) {
      this.loadForm(true);
      const email = this.form.get('email').value;
      const password = this.form.get('password').value;
      this.authService.login(email, password)
        .then(result => {
          const emailVerified: boolean = result.user.emailVerified;
          if(emailVerified){

            this.dashboardService.getDocumentByIdToPromise(USERS_COLLECTION_NAME, result.user.uid).then(
              (user: UserFirestore) => {
                this.dashboardService.getDataDocumentReference(user.roleRef).then(
                  (roleUser: Role) => {
                    const userData: UserData = {
                      uid: result.user.uid,
                      email: user.email,
                      userName: user.userName,
                      nickname: user.nickname,
                      gender: user.gender,
                      active: user.active,
                      roleRef: roleUser.uid
                    }
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.route.navigate(['/dashboard']);
                  })
                  .catch(error => {
                    console.log(error)
                  });
              },
              error => {console.log(error)}
            ).catch();
          }else{
            this.toastService.warning('El email del usuario no se encuentra verificado, revisa la bandeja principal o spam para verificar el correo elctronico')
          }
          this.loadForm(false);
        })
        .catch(error => {
          console.log(error);
          this.loadForm(false);
        });
    }
  }

}
