import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { fadeInOutAnimation } from 'src/app/shared/animations/fade-in-out.animation';
import { BaseForm } from 'src/app/shared/classes/base-form';
import { Observable } from 'rxjs';
import { UserData } from 'src/app/shared/models/user';


@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss'],
  animations: [ fadeInOutAnimation ]
})

// user: UserData;

export class NewUserComponent  implements OnInit {

  title: string = 'Nuevo usuario';
  userForm: FormGroup;
  genderList: any[]= [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
  ];

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userName: ['', Validators.required],
      nickname: ['', Validators.required],
      gender: ['M', Validators.required],
      roleRef: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  saveUserData() {
    if (this.userForm.valid) {
      const userData: UserData = this.userForm.value;

      // Aquí debes agregar lógica para guardar los datos en Firebase, por ejemplo, usando AngularFire

      // Una vez guardados los datos, puedes limpiar el formulario o redirigir a una página de éxito
      this.userForm.reset();
    }
  }
}
