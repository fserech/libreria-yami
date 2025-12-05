import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matLockPersonOutline, matPasswordOutline, matPersonOutlineOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({matLockPersonOutline})],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
 
})
export default class ForgetPasswordComponent {

}
