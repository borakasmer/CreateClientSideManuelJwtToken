export class TokenModel {
    Token: string;
    SecretKey: string;

    constructor(_token:string, _secretkey:string)
    {
        this.Token=_token;
        this.SecretKey=_secretkey;
    }
}