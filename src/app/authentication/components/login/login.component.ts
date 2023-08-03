import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { fadeInOutAnimation } from 'src/app/shared/animations/fade-in-out.animation';
import { BaseForm } from 'src/app/shared/classes/base-form';
import { Observable } from 'rxjs';

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
    private authService: AuthService) {
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
          console.log(result);
          this.loadForm(false);
        })
        .catch(error => {
          console.log(error);
          this.loadForm(false);
        });
    }
  }

}
