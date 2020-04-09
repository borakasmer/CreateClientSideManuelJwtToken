import { Component, OnInit } from '@angular/core';
import { EncryptionService } from './Services/encryptionService';
import { TokenModel } from './Model/TokenModel';
import { AppHttpService } from './Services/appHttpService';
import { WeatherForecast } from './Model/WeatherForecastModel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'clientJwt';
  weatherModel = [];
  constructor(private service: EncryptionService, private httpService: AppHttpService) { }
  ngOnInit(): void { }

  public getWeatherList() {
    let result: TokenModel = this.service.CreateToken();
    console.log(`Token : ${result.Token}`);
    console.log(`Secret : ${result.SecretKey}`);

    this.httpService.GetWeather(result.Token, result.SecretKey).then(
      (res: any) => {
        this.weatherModel = res;
      }
    )
  }
}
