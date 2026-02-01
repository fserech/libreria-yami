import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Component, OnInit } from '@angular/core';
import { matCopyrightOutline } from '@ng-icons/material-icons/outline';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  viewProviders: [provideIcons({ matCopyrightOutline })]
})

export class FooterComponent implements OnInit {

  public year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void { }
}
