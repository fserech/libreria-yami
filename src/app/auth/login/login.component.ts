import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matKeyOffOutline, matKeyOutline, matPasswordOutline, matPersonOutlineOutline, matRemoveRedEyeOutline } from '@ng-icons/material-icons/outline';
import { AuthService } from '../../shared/services/auth.service';
import { Route, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../shared/components/input/input.component';
import { LoginRequest } from '../../shared/interfaces/loginRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIconComponent, InputComponent, ReactiveFormsModule],
  viewProviders: [provideIcons({ matPersonOutlineOutline,matPasswordOutline,matRemoveRedEyeOutline,matKeyOffOutline,matKeyOutline})],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export default class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  passwordVisibility = false;
  form: FormGroup;
  loginForm: FormGroup;
  load: boolean = false;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
// [type]="passwordVisibility ? 'text' : 'password'"

  // [type]="passwordVisibility ? 'text' : 'password'"
  constructor(
      private formBuilder: FormBuilder,
      private service: AuthService,
      private router: Router) {
    this.loginForm = this.formBuilder.group({
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  onSubmit(): void {

    if(this.loginForm.valid){

      this.load = true;
      this.service.login({name: this.loginForm.controls['user'].value, password: this.loginForm.controls['password'].value} as LoginRequest).subscribe({
        next: (userData) => {
          this.loginForm.reset();
          this.load = false;
        },
        error: (errorData) => {
          this.load = false;
        },
        complete: () => {
          this.router.navigateByUrl('/inicio');
          this.loginForm.reset();
          this.load = false;
        }
      })

    } else {
      this.loginForm.markAllAsTouched();
      this.load = false;
    }
  }

}
