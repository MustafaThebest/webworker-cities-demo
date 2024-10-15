import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './services/data.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'webworker-cities-demo';

  constructor(private dataService: DataService) {

  }

  async ngOnInit(): Promise<void> {
    let data = await this.dataService.getCitiesWithAdminOne(true, false);
    console.log("Data: ", data);
  }
}
