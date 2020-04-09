using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;

public static class Helper
{
    public static string DecryptFromClientData(string secret)
    {
        try
        {
            string keyStr = "ABCDEFGHIJKLMNOP" +
                            "QRSTUVWXYZabcdef" +
                            "ghijklmnopqrstuv" +
                            "wxyz0123456789+/" +
                            "=";

            var output = "";
            int? chr1;
            int? chr2;
            int? chr3;

            int? enc1;
            int? enc2;
            int? enc3;
            int? enc4;

            var i = 0;
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            Regex base64test = new Regex(@"/[^A-Za-z0-9\+\/\=]/g;");

            if (base64test.Match(secret).Success)
            {
                Console.WriteLine("There were invalid base64 characters in the input text.\n" +
                                  "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                                  "Expect errors in decoding.");
            }
            secret = secret.Replace(@"/[^ A - Za - z0 - 9\+\/\=] / g", "");
            do
            {
                enc1 = keyStr.IndexOf(secret[i++]);
                enc2 = keyStr.IndexOf(secret[i++]);
                enc3 = keyStr.IndexOf(secret[i++]);
                enc4 = keyStr.IndexOf(secret[i++]);

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + (char)chr1;
                if (enc3 != 64)
                {
                    output = output + (char)chr2;
                }
                if (enc4 != 64)
                {
                    output = output + (char)chr3;
                }
                chr1 = chr2 = chr3 = null;
                enc1 = enc2 = enc3 = enc4 = null;
            } while (i < secret.Length);
            output = System.Web.HttpUtility.UrlDecode(output, Encoding.UTF8);
            var pattern = new Regex("[|]");
            output = pattern.Replace(output, "+");
            return output;
        }
        catch
        {
            return "";
        }
    }

    //dotnet add package System.IdentityModel.Tokens.Jwt --version 6.5.0
    public static bool ValidateJwtToken(string webToken, string secret)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secret);
        try
        {
            tokenHandler.ValidateToken(webToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                ValidateIssuer = false,
                ValidateAudience = false,
                //ValidateLifetime = false,
                IssuerSigningKey = new SymmetricSecurityKey(key),
            }, out SecurityToken validatedToken);
            DateTime localDate = validatedToken.ValidTo.ToLocalTime();
            //Expire Time Check. It must be shorter then 30 minutes. If it is bigger then 30 minutes. It means, someone try to hack!
            TimeSpan span = DateTime.Now - localDate;
            if (span.TotalMinutes > 30)
            {
                Console.WriteLine("Expire time more then 30 minutes!");
                return false;
            }
            //  
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
        return true;
    }
}