using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace serverJwt.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            //Can not request from Postman or exclude form this (local) portal. Check the Host Url!
            if (this.HttpContext.Request.Host.Host != "localhost")
            {
                HttpContext.Response.StatusCode = 401;
                return null;
            }
            string authHeader = this.HttpContext.Request.Headers["Authorization"];
            if (authHeader != null && authHeader.StartsWith("Bearer"))
            {
                var token = authHeader.Substring("Bearer ".Length).TrimStart();

                var secret = this.HttpContext.Request.Headers["EncryptedSecret"].FirstOrDefault();
                secret = Helper.DecryptFromClientData(secret);

                if (Helper.ValidateJwtToken(token, secret))
                {
                    var rng = new Random();
                    return Enumerable.Range(1, 5).Select(index => new WeatherForecast
                    {
                        Date = DateTime.Now.AddDays(index).ToShortDateString(),
                        TemperatureC = rng.Next(-20, 55),
                        Summary = Summaries[rng.Next(Summaries.Length)]
                    })
                    .ToArray();
                }
                else
                {
                    HttpContext.Response.StatusCode = 401;
                    return null;
                }
            }
            else
            {
                HttpContext.Response.StatusCode = 401;
                return null;
            }
        }
    }
}
