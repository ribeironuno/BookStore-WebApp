import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], filterString: string, propName: any): any[] {
    const result: any = new Set();
    if (!value || filterString === '' || propName === '') {
      return value;
    }
    value.forEach((a: any) => {
      //if there is only numbers in (ISBN)
      if (/^[0-9]+/.test(filterString)) {
        if (
          a['ISBN'].trim().toLowerCase().includes(filterString.toLowerCase())
        ) {
          result.add(a);
        }
      } else {
        if (
          a['title'].trim().toLowerCase().includes(filterString.toLowerCase())
        ) {
          result.add(a);
        }
        if (
          a['author']['name']
            .trim()
            .toLowerCase()
            .includes(filterString.toLowerCase())
        ) {
          result.add(a);
        }
      }
    });
    return Array.from(result);
  }
}
