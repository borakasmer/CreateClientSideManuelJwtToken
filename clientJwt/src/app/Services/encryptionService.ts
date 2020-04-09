import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AppConfigService } from './appConfigService';
import { TokenModel } from '../Model/TokenModel';

@Injectable({ providedIn: 'root' })
export class EncryptionService {


    constructor(private appConfigService: AppConfigService) { }

    private encodeSource(secretKey: string) {
        let encodedSource = CryptoJS.enc.Base64.stringify(secretKey);
        encodedSource = encodedSource.replace(/=+$/, '');

        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        return encodedSource;
    }

    encrptedSecret: string = "";
    public CreateToken() {
        var header = {
            "alg": "HS256",
            "typ": "JWT"           
        };

        var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
        var encodedHeader = this.encodeSource(stringifiedHeader);

        let actual30mTimeInSeconds = String(new Date().getTime() / 1000 + 60 * 30); //iat Unix timestamp format.. 30 minutes
        var data = {
            "deviceID": new Date().getTime() + this.appConfigService.apiDeviceKey,
            "exp": actual30mTimeInSeconds,
            "iat": actual30mTimeInSeconds
        };

        var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
        var encodedData = this.encodeSource(stringifiedData);

        var token = encodedHeader + "." + encodedData;

        var signature = CryptoJS.HmacSHA256(token, this.Guid());
        signature = this.encodeSource(signature);

        var signedToken = token + "." + signature;

        return new TokenModel(signedToken, this.encrptedSecret);
    }

    public Guid(): string {
        let _this = this;

        return String(['xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })].map(x => {
            _this.encrptedSecret = _this.EncryptText(x);
            return x;
        }));

        /* .replace(/./g, function (x) {
            _this.encrptedSecret += x;
            return x;
        }); */
    }

    keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";

    public EncryptText(secret: string): string {
        var sendText = secret.split('+').join('|');
        let input = escape(sendText);
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;

            }
            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output;
    }
}