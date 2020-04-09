import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppHttpService {
    constructor(private httpClient: HttpClient) { }
    baseurlString: string = "http://localhost:1923/WeatherForecast";
    public GetWeather(token: string, encryptedSecret: string): Promise<any> {
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            EncryptedSecret: encryptedSecret
        });

        const options = {
            headers: headers
        };

        return this.httpClient
            .get(this.baseurlString, options)
            .toPromise()
            .then(
                (res: any) => {
                    return res;
                }
            )
            .catch(x => {
                if (x.status == 401) {
                    alert("Autherization ERROR : 401")
                }
                return Promise.reject(x);
            });
    }
}