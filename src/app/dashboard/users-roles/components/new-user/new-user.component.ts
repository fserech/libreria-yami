import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { fadeInOutAnimation } from 'src/app/shared/animations/fade-in-out.animation';
import { BaseForm } from 'src/app/shared/classes/base-form';
import { Observable } from 'rxjs';
import { UserData } from 'src/app/shared/models/user';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { UsersService } from '../../services/users.service';


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
  load: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private toastService: ToastService,
    private usersService: UsersService) {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userName: ['', Validators.required],
      nickname: ['', Validators.required],
      gender: ['', Validators.required],
      roleRef: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  saveUserData() {
    this.load = true;
    if (this.userForm.valid) {
      const userData: UserData = this.userForm.value;
      this.usersService.newUserEmailAndPassword(userData)
      .then(response => {console.log(response); this.load = false;this.userForm.reset();})
      .catch(error => {console.log(error); this.load = false;this.userForm.reset();})

    }
  }
}
