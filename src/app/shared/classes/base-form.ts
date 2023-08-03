import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DirtyFormGuard } from '../guards/dirty-form.guard';


@Injectable({
  providedIn: 'root'
})

export abstract class BaseForm{

  public form: FormGroup;
  public load: boolean = false;
  public showForm: boolean = true;
  public mode: string = 'view';
  public record: any = null;
  public interForms: boolean = true;

  constructor(protected fb: FormBuilder) {}

  protected abstract isDirty(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

  protected abstract getFields(): FormGroup;

  loadForm(load: boolean){
    if(load){
      this.load = true;
      this.showForm = false;
    }else{
      this.load = false;
      this.showForm = true;
    }
  }

  private createFormControl(name: string, existRecord?: boolean, defaultValue?: string, validators?: Array<ValidationErrors>): FormControl {

    let validatorList = [];
    if (!defaultValue) defaultValue = '';
    if (validators) validatorList = validators;

    return new FormControl({ value: existRecord ? this.record[name] : '', disabled: this.disabledCondition() }, validatorList);
  }

  protected disabledCondition(): boolean {
    const disabled = this.mode === 'view';
    return disabled;
  }


}

