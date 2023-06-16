import cors from 'cors'
import express from 'express'
import chalk from 'chalk'

// Config
/*
  URL : Url of minecraft-mp.com server
  ApiPort : Port Of API
  RefreshRate : Time update in (MS)
  AllowedUrl : use * for all, use example http://localhost for localhost only
*/
const config = {
  WebURL: "https://minecraft-mp.com/server-s314197",
  ApiPort: 2022,
  RefreshRate: 5000,
  AllowedUrl: '*'
}

// Global Variable
let ServerProperties = {}
let disconnect = true

async function getData() {
  fetch(config.WebURL)
  .then(async (Res) => {
    if (disconnect) {
      console.log(chalk.cyanBright(`Success Connected to ${config.WebURL}`))
      disconnect = false
    };
    let HtmlValue = `${await Res.text()}`;
    const srcProperty = HtmlValue.match(/src="(.*?)"/g)
    const strongProperties = HtmlValue.match(/<strong>(.*?)<\/strong>/g)
    const spanProperties = HtmlValue.match(/<span(.*?)>(.*?)<\/span>/g)
    const tdProperties = HtmlValue.match(/<td>(.*?)<\/td>/g)
    ServerProperties = {
      Name: HtmlValue.match(/<h1 class="text-break">(.*?)<\/h1>/g)[0].replace('<h1 class="text-break">', '').replace('</h1>', ''),
      Logo: ('https://minecraft-mp.com'+srcProperty[1].match(/src="(.*?)"/)[1]),
      Banner: srcProperty[2].match(/src="(.*?)"/)[1],
      Address: strongProperties[3].match(/<strong>(.*?)<\/strong>/)[1],
      McVersion: tdProperties[6].match(/<td><a href="(.*?)" class="label label-primary" title="(.*?)">(.*?)<\/a><\/td>/)[3],
      RegisteredBy: tdProperties[9].match(/<td>(.*?)<\/td>/)[1],
      RegisteredSince: tdProperties[11].match(/<td>(.*?)<\/td>/)[1],
      RegisteredSince: tdProperties[11].match(/<td>(.*?)<\/td>/)[1],
      LastUpdate: tdProperties[13].match(/<td>(.*?)<\/td>/)[1],
      UpTime: tdProperties[16].match(/<td><span(.*?)>(.*?)<\/span><\/td>/)[2],
      Vote: tdProperties[18].match(/<td>(.*?)<\/td>/)[1],
      Rank: tdProperties[20].match(/<td>(.*?)<\/td>/)[1],
      Score: tdProperties[22].match(/<td>(.*?)<\/td>/)[1],
      Favorite: tdProperties[24].match(/<td>(.*?)<\/td>/)[1],
      Status: {
        ServerStatus: spanProperties[8].match(/<span(.*?)>(.*?)<\/span>/)[2],
        LastCheck: strongProperties[6].match(/<strong><small>(.*?)<\/small><\/strong>/)[1]
      },
      Player: {
        Online: (tdProperties[2].match(/<td><strong>(.*?)<\/strong><\/td>/)[1]).split('/')[0],
        MaxOnline: (tdProperties[2].match(/<td><strong>(.*?)<\/strong><\/td>/)[1]).split('/')[1]
      }
    }
    setTimeout(() => {
      getData()
    }, config.RefreshRate);
  })
  .catch((Err) => {
    console.log(chalk.red(`Disconnected from ${config.WebURL}, Reconneting...`))
    disconnect = true
    setTimeout(() => {
      getData()
    }, 6000);
  })
}

const app = express()
app.use(cors({
  origin: config.AllowedUrl
}))

app.get('/', (req ,res)=>{
  res.status(200).json(ServerProperties)
})

app.listen(config.ApiPort, ()=>{
  console.log(chalk.greenBright(`Api Started at port ${config.ApiPort}`))
})

// Start The Script Update Data
getData()