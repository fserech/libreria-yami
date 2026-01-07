import { NgClass, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowDropDownCircleOutline, matKeyboardArrowDownOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  viewProviders: [
    provideIcons({ matKeyboardArrowDownOutline, matArrowDropDownCircleOutline}) ]
})

export class SelectSearchComponent implements OnInit, AfterViewInit {

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() label: string;
  @Input() icon: string;
  @Input() placeholder: string;
  @Output() changes = new EventEmitter<string>();

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  people: any[] = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
    { id: 4, name: 'Tom Cook' },
    { id: 5, name: 'Tanya Fox' },
    { id: 6, name: 'Hellen Schmidt' },
    // Agregar más elementos
    { id: 7, name: 'John Doe' },
    { id: 8, name: 'Jane Smith' },
    { id: 9, name: 'Michael Johnson' },
    { id: 10, name: 'Emily Brown' },
    { id: 11, name: 'Christopher Wilson' },
    { id: 12, name: 'Jessica Lee' },
    { id: 13, name: 'Matthew Davis' },
    { id: 14, name: 'Sarah Martinez' },
    { id: 15, name: 'William Anderson' },
    { id: 16, name: 'Elizabeth Taylor' },
    { id: 17, name: 'Daniel Garcia' },
    { id: 18, name: 'Ashley Hernandez' },
    { id: 19, name: 'Joseph Walker' },
    { id: 20, name: 'Olivia Clark' }
  ];

  selected: any = this.people[0];
  query: string = '';
  showOptions: boolean = false;

  get filteredPeople(): any[] {
    return this.query === '' ? this.people : this.people.filter(person =>
      person.name.toLowerCase().replace(/\s+/g, '').includes(this.query.toLowerCase().replace(/\s+/g, ''))
    );
  }

  search(): void {
    if (this.query === '') {
      this.showOptions = false;
    } else {
      this.showOptions = true;
    }
  }

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
    if (!this.showOptions) {
      this.query = '';
    }
  }

  selectItem(person: any): void {
    this.selected = person;
    this.showOptions = false;
    this.query = '';
  }
}
