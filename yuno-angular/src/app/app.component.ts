import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'yuno-angular';
}
