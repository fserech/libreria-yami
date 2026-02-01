import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe utilidad: convierte un número N en un array de N elementos.
 * Uso en template: *ngFor="let i of 5 | makeArray"
 * o con la sintaxis nueva: @for (item of count | makeArray; track $index)
 */
@Pipe({ name: 'makeArray', standalone: true })
export class MakeArrayPipe implements PipeTransform {
  transform(value: number): number[] {
    if (!value || value <= 0) return [];
    return Array.from({ length: value }, (_, i) => i);
  }
}
