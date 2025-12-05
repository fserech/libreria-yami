import { AfterViewInit, Component, DoCheck, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { matAddCircleOutlineOutline, matAddIcCallOutline, matAddLocationAltOutline, matAlternateEmailOutline, matArrowBackOutline, matCheckCircleOutline, matKeyOffOutline, matKeyOutline, matLocalPhoneOutline, matPasswordOutline, matTodayOutline } from '@ng-icons/material-icons/outline';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { NgIf } from '@angular/common';
import { provideIcons, NgIconComponent } from '@ng-icons/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import BaseForm from '../../../../shared/classes/base-form';
import { URL_USERS } from '../../../../shared/constants/endpoints';
import { AuthService } from '../../../../shared/services/auth.service';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { User } from '../../../../shared/interfaces/user-data';
import { CheckboxComponent } from "../../../../shared/components/checkbox/checkbox.component";
import { ChatBubbleComponent } from "../../../../shared/components/chat-bubble/chat-bubble.component";
import { RadioButtonComponent } from "../../../../shared/components/radio-button/radio-button.component";
import { MatRadioChange } from '@angular/material/radio';

@Component({
    selector: 'app-users-form',
    standalone: true,
    templateUrl: './users-form.component.html',
    styleUrl: './users-form.component.scss',
    viewProviders: [provideIcons({
            matLocalPhoneOutline, matArrowBackOutline, matPasswordOutline, matAddLocationAltOutline,
            matAddIcCallOutline, matTodayOutline, matKeyOutline, matKeyOffOutline, matAlternateEmailOutline,
            matCheckCircleOutline, matAddCircleOutlineOutline
        })],
    imports: [HeaderComponent, NgIf, InputComponent, NgIconComponent, ToggleComponent, SelectComponent, ReactiveFormsModule, ChatBubbleComponent, CheckboxComponent, RadioButtonComponent]
})

export default class UsersFormComponent extends BaseForm implements OnInit {

  @ViewChild('checkbox') checkbox: CheckboxComponent;
  form: FormGroup;
  users: User;
  emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passRegex: RegExp = /^(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,14}$/;
  userRegex: RegExp = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{3,20}$/;

  passwordVisibility = false;
  optionsRole = [
    { value: 1, label: 'Administrador' },
    { value: 2, label: 'Vendedor' },
  ];

 constructor(
   private crud: CrudService,
   private toast: ToastService,
   private router: Router,
   private route: ActivatedRoute,
   private auth: AuthService,
   private bpo: BreakpointObserver,
   private fb: FormBuilder){
     super(crud, toast, auth, bpo);
     this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
     if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
     this.crud.baseUrl = URL_USERS;

     this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(this.userRegex)]),
      email: new FormControl('', [Validators.required, Validators.pattern(this.emailRegex)]),
      userPassword: new FormControl('', [ Validators.required, Validators.pattern(this.passRegex), Validators.minLength(8)]),
      role: new FormControl('', [Validators.required]),
      days_sale: this.fb.array([false,false,false,false,false,false,false])
     });
  }

  ngOnInit() {
    if (this.mode === 'edit') {
      this.load = true;
      firstValueFrom(this.crud.getId(this.id))
        .then((response: any) => {

          const daysResponse: string = response.daysSale.join(',');
          const daryArrayBoolean: boolean[] = this.getDaysSelectedBoolean(daysResponse);
          const daysArray = this.fb.array(daryArrayBoolean);

          this.form.controls['name'].setValue(response.name);
          this.form.controls['email'].setValue(response.email);
          this.form.controls['role'].setValue((response.role == 0) ? 1 : 2);
          this.form.setControl('days_sale', daysArray);

          this.form.controls['userPassword'].clearValidators();
          this.form.controls['userPassword'].setValidators([]);
          this.form.controls['userPassword'].updateValueAndValidity();
          this.form.controls['userPassword'].setValue('');

          if(this.form.controls['role'].value === 1){
            this.form.controls['days_sale'].disable();
          }
        })
        .catch((error: any) => {
        })
        .finally(() => {
          this.load = false;
        });
      }
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  back(){
    this.router.navigate(['dashboard/users']);
  }

  async submit(){
    this.load = true;
    this.isSaving = true;
    const formArray = this.form.get('days_sale') as FormArray;
    const user: User = {
      id_user: (this.id) ? this.id : null,
      name: this.form.controls['name'].value,
      email: this.form.controls['email'].value,
      password: this.form.controls['userPassword'].value,
      role: this.form.controls['role'].value,
      days_sale: this.getDaysSelect(formArray.value)
    }

    if(this.checkBooleanArray(formArray.value)){
      if(this.mode === 'edit'){
        const password: string = this.form.controls['userPassword'].value;
        if(password.length > 7 && password.length < 15 || password.length === 0){
          if(user.role === 1) user.role = 'ROLE_ADMIN'
          if(user.role === 2) user.role = 'ROLE_USER'
          await firstValueFrom(this.crud.updateUser(this.id, user))
          .then((response: any) => {
            this.toast.success(response.message);
          })
          .catch((error: any) => {
            this.toast.error(error.message);
          })
          .finally(() => {
            this.load = false;
            this.router.navigate(['dashboard/users']);
          });
        }else{
          this.toast.error('La contraseña debe tener minímo 8 caracteres');
          this.load = false;
        }
      }else if(this.mode === 'new'){

        await firstValueFrom(this.crud.save(user))
              .then((response: any) => {
                this.toast.success(response.message);
              })
              .catch((error: any) => {
                this.toast.error(error.message);
              })
              .finally(() => {
                this.load = false;
                this.router.navigate(['dashboard/users']);
              });
      }else{
        this.toast.info('Estas en modo vista');
        this.router.navigate(['dashboard/users']);
      }
    }else{
      this.toast.error('Asigna al menos un día para el vendedor');
      this.load = false;
    }
  }

  checkBooleanArray(values: boolean[]): boolean {
    return values.some(value => value === true);
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  changeRole(ev: MatRadioChange){
    if(ev.value === 1){
      const daysArray = this.fb.array([true, true, true, true, true, true, true]);
      this.form.setControl('days_sale', daysArray);
      this.form.controls['days_sale'].disable();
    }
    if(ev.value === 2){
      const daysArray = this.fb.array([false, false, false, false, false, false, false]);
      this.form.setControl('days_sale', daysArray);
      this.form.controls['days_sale'].enable();
    }
  }

  changeDays(formArray: FormArray) {
  }

  getDaysSelect(values:boolean[]): string{
    let days: string[] = [];
    values.map((value: boolean, index: number) => {
      if(value)days.push((index + 1).toString());
    });
    const result = days.join(',');
    return result;
  }

  getDaysSelectedBoolean(daysSelected: string): boolean[]{
    const days = daysSelected.split(',');
    let value: boolean[] = [];
    for (let i = 1; i <= 7; i++) {
      if (days.includes(i.toString())) {
        value.push(true);
      } else {
        value.push(false);
      }
    }
    return value;
  }
}
