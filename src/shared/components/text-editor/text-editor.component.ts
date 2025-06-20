import { NgClass, NgFor } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ModeService } from '../../../services/mode.service';
import { MatDialog } from '@angular/material/dialog';
import { InsertTextComponent } from './components/insert-text/insert-text.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent implements AfterContentChecked{
  mode: string = 'light';
  icons: Set<{ value: string, label: string }> = new Set([
    { value: 'fw-bold', label: 'bi-type-bold' },
    { value: 'fst-italic', label: 'bi-type-italic' },
    { value: 'underline', label: 'bi-type-underline' },
    { value: 'line-through', label: 'bi-type-strikethrough' }
  ]);
  colors: Set<{ value: string, label: string }> = new Set([
    { value: 'text-dark', label: 'dark' },
    { value: 'text-white', label: 'white' },
    { value: 'text-danger', label: 'red' },
    { value: 'text-warning', label: 'yellow' },
    { value: 'text-success', label: 'green' },
    { value: 'text-primary', label: 'blue' },
    { value: 'text-info', label: 'light blue' },
    { value: 'text-secondary', label: 'gray' }
  ]);
  sizes: Set<{ value: string, label: string }> = new Set([
    { value: 'fs-5', label: 'smaller' },
    { value: 'fs-4', label: 'small' },
    { value: 'fs-3', label: 'medium' },
    { value: 'fs-2', label: 'big' },
    { value: 'fs-1', label: 'bigger' }
  ]);
  selectedItems: string[] = [];
  @Input() textareaInnerHTML: string = '';
  @Output() sendUpdates: EventEmitter<any> = new EventEmitter<any>();
  @Input() remainingCharacters: number = 0;
  previousValueC:string = 'text-dark';
  previousValueS:string = 'fs-6';
  constructor(private modeService: ModeService, private matDialog: MatDialog, private toastr: ToastrService, private cdr: ChangeDetectorRef) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  selectItems(item: string) {
    
    const dialogRef = this.matDialog.open(InsertTextComponent, {data: [item, this.icons, this.colors, this.sizes, this.remainingCharacters] });
    dialogRef.afterClosed().subscribe((data: any) => {
      this.previousValueC = (document.getElementById('colors') as HTMLSelectElement).value
      this.previousValueS = (document.getElementById('sizes') as HTMLSelectElement).value

      if (data) {
        let element = data;
        this.update(data);
      } else {
        this.toastr.warning("Non hai aggiunto niente");
      }
    })
  }

  update(value: any) {
    this.sendUpdates.emit(value);
  }
  clearSelectedItems(item: string) {
    return this.selectedItems = this.selectedItems.filter((a: string) => a != item);
  }
  checkValue(value:string,section:string){
    if(section=='color'){
      let color = document.getElementById('colors') as HTMLSelectElement;
      if(color.value==this.previousValueC){
        this.selectItems(value);
      }
    }else if(section=='size'){
      let size = document.getElementById('sizes') as HTMLSelectElement;
      if(size.value==this.previousValueS){
        this.selectItems(value);
      }
    }else{
      this.toastr.warning("What did you selected?");
    }
  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
