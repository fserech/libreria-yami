import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCancelPresentationOutline, matDeleteOutline, matModeEditOutline, matMoreVertOutline, matReceiptLongOutline, matRemoveRedEyeOutline, matUploadOutline } from '@ng-icons/material-icons/outline';
import { OptionsChatBubble } from '../../interfaces/options-chat-bubble';
import { NgClass } from '@angular/common';
// import { Dropdown, DropdownInterface, DropdownOptions, InstanceOptions } from 'flowbite';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { bootstrapBoxSeam, bootstrapCheckCircleFill, bootstrapXCircle } from '@ng-icons/bootstrap-icons';
@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [NgIcon, NgClass, ClickOutsideDirective],
  templateUrl: './chat-bubble.component.html',
  styleUrl: './chat-bubble.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [ provideIcons({ matMoreVertOutline, matModeEditOutline, matDeleteOutline, matUploadOutline,
    matCancelPresentationOutline, bootstrapBoxSeam, matRemoveRedEyeOutline, bootstrapCheckCircleFill, matReceiptLongOutline,
    bootstrapXCircle  }) ]

})
export class ChatBubbleComponent implements OnInit{

  @Input() id: number = 0;
  @Input() name: string;
  @Input() options: OptionsChatBubble[];
  @Output() selectOption: EventEmitter<any> = new EventEmitter();
  public isMenuOpen = false;

  constructor() { }

  ngOnInit(): void {};


  clickAction(option: OptionsChatBubble){
    option.id = this.id;
    this.selectOption.emit(option);
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
