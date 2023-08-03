import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
  state('visible', style({ opacity: 1 })),
  state('hidden', style({ opacity: 0 })),
  transition('visible <=> hidden', animate('500ms ease-in-out')),
]);
