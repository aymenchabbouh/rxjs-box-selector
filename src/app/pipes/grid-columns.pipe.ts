import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gridColumns',
  standalone: true
})
export class GridColumnsPipe implements PipeTransform {
  transform(totalOptions: number): string {
    const cols = totalOptions <= 20 ? Math.ceil(totalOptions / 2) : 20;
    return `repeat(${cols}, 1fr)`;
  }
}
