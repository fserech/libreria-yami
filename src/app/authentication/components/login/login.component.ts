import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { error } from 'console';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate(500)),
    ]),
  ]
})
export class LoginComponent  implements OnInit {

  form: FormGroup;
  hidePassword = true;
  load: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private authService: AuthService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  login() {
    if (this.form.valid) {
      this.load = true;
      const email = this.form.get('email').value;
      const password = this.form.get('password').value;
      this.authService.login(email, password)
        .then(result => {
          console.log(result);
          this.load = false;
        })
        .catch(error => {
          console.log(error);
          this.load = false;
        });
    }
  }

  navigate(route: string){
    route === 'dashboard' ? this.route.navigate(['dashboard']) : this.route.navigate(['auth/' + route]);
  }

}
