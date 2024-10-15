import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  url: string = "http://localhost:3000";

  constructor(private http: HttpClient) {

  }

  public async getCitiesWithAdminOne(withAdmin1: boolean, withAdmin2: boolean) {
    let tick = performance.now();
    let cities: any[] = await this.getCities();

    let adminOne: any[] = [];
    withAdmin1 ? adminOne = await this.getAdminOne() : {};

    let adminTwo: any[] = [];
    withAdmin2 ? adminTwo = await this.getAdminTwo() : {};

    if (typeof Worker !== undefined) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('../webworkers/data.worker', import.meta.url));
        console.log("Worker: ", worker);
        worker.postMessage({
          cities: cities,
          adminOne: adminOne,
          adminTwo: adminTwo
        });

        worker.onmessage = (event) => {
          console.log(`It took: ${performance.now() - tick}`);
          resolve(event.data); // event.data contains the modified cities
        };

        // Handle errors
        worker.onerror = (error) => {
          reject(error);
        };
      })
    } else {
      // Fallback if Web Workers are not supported
      return this.fallbackProcessing(cities, adminOne, adminTwo);
    }
  }

  public async fallbackProcessing(cities: any[], adminOne: any[], adminTwo: any[]) {
    let tick = performance.now();

    cities.map((city: any) => {
      if (adminOne.length > 0) {
        let foundAdminOne = adminOne.find((item: any) => {
          return item.code == `${city.country}.${city.admin1}`;
        });

        if (foundAdminOne) {
          city["subdivision1"] = foundAdminOne.name;
        };
      }

      if (adminTwo.length > 0) {
        let foundAdminTwo = adminTwo.find((item: any) => {
          return item.code == `${city.country}.${city.admin1}.${city.admin2}`;
        });

        if (foundAdminTwo) {
          city["subdivision2"] = foundAdminTwo.name;
        };
      }
    });

    console.log(`It took: ${performance.now() - tick}`);
    return cities;
  }


  public async getCities(): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url + "/cities"));
  }

  public async getAdminOne(): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url + "/admin1"));
  }

  public async getAdminTwo(): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url + "/admin2"));
  }
}
