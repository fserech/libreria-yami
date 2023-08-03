import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { fadeInOutAnimation } from 'src/app/shared/animations/fade-in-out.animation';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
  animations: [ fadeInOutAnimation ]
})
export class ForgetPasswordComponent  implements OnInit {

  form: FormGroup;
  load: boolean = false;
  showForm: boolean = true;

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


    reset(){
      if (this.form.valid) {
        console.log('Email:', this.form.get('email').value);
      }
    }

    loadForm(load: boolean){
      if(load){
        this.load = true;
        this.showForm = false;
      }else{
        this.load = false;
        this.showForm = true;
      }
    }
  navigate(route: string){
    // this.route.navigate(['login'])
    this.route.navigate(['auth/' + route]);
  }

}
