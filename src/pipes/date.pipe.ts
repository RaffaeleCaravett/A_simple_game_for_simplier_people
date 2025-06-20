import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'date' })

export class FormatDate implements PipeTransform {

    constructor(private datePipe: DatePipe) { }
    transform(value: string): string {
        return this.datePipe.transform(value, '"yyyy-MM-dd')!;
    }

}