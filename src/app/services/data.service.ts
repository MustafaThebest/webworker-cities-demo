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

  private chunkify(array: any[], concurrentWorkers: number) {
    let chunks = [];
    for (let i = concurrentWorkers; i > 0; i--) {
      chunks.push(array.splice(0, Math.ceil(array.length / i)))
    }
    return chunks;
  }

  public async getCitiesWithAdminOne(withAdmin1: boolean, withAdmin2: boolean, concurrentWorkers: number) {
    let tick = performance.now();
    let cities: any[] = await this.getCities();
  
    let adminOne: any[] = [];
    if (withAdmin1) {
      adminOne = await this.getAdminOne();
    }
  
    let adminTwo: any[] = [];
    if (withAdmin2) {
      adminTwo = await this.getAdminTwo();
    }
  
    if (typeof Worker !== 'undefined') {
      return new Promise((resolve, reject) => {
        cities = this.chunkify(cities, concurrentWorkers);
  
        let completedWorkers: number = 0;
        let result: any[] = [];
  
        cities.forEach((data) => {
          const worker = new Worker(new URL('../webworkers/data.worker', import.meta.url));
          worker.postMessage({
            cities: data,
            adminOne: adminOne,
            adminTwo: adminTwo
          });
  
          worker.onmessage = (event) => {
            // Use push to add data from the worker to the result array
            result.push(...event.data); // Assuming event.data is an array
  
            completedWorkers++;
  
            // Check if all workers have completed
            if (completedWorkers === cities.length) {
              console.log(`${completedWorkers} workers took ${performance.now() - tick} ms`);
              resolve(result); // Resolving with the modified cities
            }
          };
  
          // Handle errors
          worker.onerror = (error) => {
            reject(error);
          };
        });
      });
    } else {
      // Fallback if Web Workers are not supported
      return this.fallbackProcessing(cities, adminOne, adminTwo);
    }
  }

  private async fallbackProcessing(cities: any[], adminOne: any[], adminTwo: any[]) {
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
