import { Component, Input, Output, EventEmitter, OnInit, forwardRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

export interface AutocompleteOption {
  label: string;
  icon: string;
  value: any;
}

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true
    }
  ]
})
export class AutocompleteInputComponent implements ControlValueAccessor {
  @Input() searchFn!: (query: string) => Observable<AutocompleteOption[]>;
  @Input() placeholder: string = 'Rechercher';
  @Input() minChars: number = 3;
  @Output() optionSelected = new EventEmitter<AutocompleteOption>();

  searchControl = new FormControl('');
  options: AutocompleteOption[] = [];
  showDropdown = false;
  isLoading = false;
  selectedIndex = -1;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    // Setup search in constructor to use takeUntilDestroyed
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
      switchMap(query => {
        if (!query || query.length < this.minChars) {
          this.options = [];
          this.showDropdown = false;
          return of([]);
        }

        this.isLoading = true;
        return this.searchFn(query).pipe(
          catchError(() => {
            this.isLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe(options => {
      this.options = options;
      this.isLoading = false;
      this.showDropdown = options.length > 0;
      this.selectedIndex = -1;
    });
  }

  selectOption(option: AutocompleteOption, index: number): void {
    this.selectedIndex = index;
    this.searchControl.setValue(option.label, { emitEvent: false });
    this.showDropdown = false;
    this.onChange(option.value);
    this.optionSelected.emit(option);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown || this.options.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
        this.scrollToSelected();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.scrollToSelected();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.options.length) {
          this.selectOption(this.options[this.selectedIndex], this.selectedIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showDropdown = false;
        this.selectedIndex = -1;
        break;
    }
  }

  private scrollToSelected(): void {
    // Scroll the selected option into view
    setTimeout(() => {
      const dropdown = this.elementRef.nativeElement.querySelector('.dropdown');
      const selectedElement = dropdown?.querySelector('.option.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      this.selectedIndex = -1;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      this.searchControl.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  onInputBlur(): void {
    this.onTouched();
  }
}
