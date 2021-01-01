const express = require('express');
var cors = require('cors');
var app = express();
const atob = require('atob');

app.use(cors())


const {
    default: Axios
} = require('axios');

app.get('/', async (req, res) => {
    console.log(req.socket.remoteAddress)
    console.log(req.ip)
    console.log("==IP ADDR==")
    console.log(req.headers['x-forwarded-for'])
    console.log("========USER AGENT=======")
    console.log(req.headers["user-agent"])

    const ip = req.headers['x-forwarded-for']
    const agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36';

    // const url = "https://api.ip8.com/ip/lookup/"+ip;
    const url = "https://api.ip8.com/ip/lookup/223.238.97.18";

    await Axios.get(url, {
        headers: {
            'user-agent': agent,
        }
    }).then(async result => {
        await Axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${result.data.details.geoip[0].city.name}&appid=84f0c05e16abc57b03ca8fa00b59f78e&units=metric`).then((weather) => {
            console.log(weather.data.weather[0].description)
            console.log(weather.data.main.temp)
            const data = {
                headers: req.headers['user-agent'],
                ip,
                isp: result.data.details.geoip[0].isp.org,
                ispFull: result.data.details.geoip[0].isp.ASNname,
                city: result.data.details.geoip[0].city.name,
                pin: result.data.details.geoip[0].city.zip,
                timezone: result.data.details.geoip[0].city.timezone,
                continent: result.data.details.geoip[0].continent.name,
                country: result.data.details.geoip[0].country.name,
                latitude: result.data.details.geoip[0].city.details.latitude,
                longitude: result.data.details.geoip[0].city.details.longitude,
                weather: weather.data.weather[0].description,
                temperature: weather.data.main.temp
            }
    
            return res.status(200).json(data)
        }).catch(e => {
            console.log( "Cant get weather data lol" ,e)
        })
    }).catch(e => {
        console.log("Something Went Wrong, wonderfully handled exception", e)
    })

});


app.get('/generate/:data', async (req, res) => {    // Because URL PARAMS ARE COOLER
    // this can be stored in the Database now
    console.log(atob(req.params.data));
    res.json({cookie: req.params.data})
})

app.get('/if-vpn/:data', async(req, res) => {
    const data = atob(req.params.data)
    // Timezone Stuff
    let options = {
        timeZone: data.timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    },
    formatter = new Intl.DateTimeFormat([], options);
    console.log(formatter.format(new Date()));
    return res.json({message: "yay i work"})
})

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Waiting on port for someone :) ${port}`);
});