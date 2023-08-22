import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  themeToggle = false;

  constructor() {
    console.log('iniciando app')
    const darkModeEnabled = JSON.parse(localStorage.getItem('darkMode'));
    const mode: string = darkModeEnabled ? '(prefers-color-scheme: dark)' : '(prefers-color-scheme: light)';

    const prefersDark = window.matchMedia(mode);
    this.initializeDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));
  }

  initializeDarkTheme(isDark) {
    this.themeToggle = isDark;
    this.toggleDarkTheme(isDark);
  }

  toggleDarkTheme(shouldAdd) {
    // console.log(shouldAdd);
    document.body.classList.toggle('dark', shouldAdd);
  }
}
