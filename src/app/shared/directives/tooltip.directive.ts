import { Directive, ElementRef, Input, HostListener, Renderer2, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular';


@Directive({
  selector: '[ionTooltip]'
})
export class TooltipDirective {

  @Input('ionTooltip') tooltipText: string;
  private tooltipElement: HTMLElement;
  // @Input('appTooltip') tooltipText: string; // Texto del tooltip a recibir como entrada

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setAttribute(this.el.nativeElement, 'title', this.tooltipText);
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    console.log('mouseleave');
    this.hideTooltip();
  }

  private showTooltip() {
    this.tooltipElement = this.renderer.createElement('div');
    this.tooltipElement.textContent = this.tooltipText;
    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    this.renderer.addClass(this.tooltipElement, 'rounded-pill');
    this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
  }

  private hideTooltip() {
    this.tooltipElement = this.el.nativeElement.querySelector('.custom-tooltip');
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipElement);
    }
  }
}
