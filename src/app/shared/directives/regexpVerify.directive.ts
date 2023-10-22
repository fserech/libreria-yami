import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[regexpVerify]'
})
export class RegexpVerifyDirective {

  @Input() regex: string;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    console.log('value: ',input.value);
    if (this.regex) {
      const pattern = new RegExp(this.regex, 'g');
      input.value = input.value.replace(pattern, '');
      event.stopPropagation(); // Detiene la propagación del evento input
    }
  }
}
