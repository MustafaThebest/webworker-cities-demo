// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Import provideHttpClient

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // your routes
    ]),
    provideHttpClient(withInterceptorsFromDi()) // Move this here
  ]
}).catch(err => console.error(err));
