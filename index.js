import cors from 'cors'
import express from 'express'
import chalk from 'chalk'
import fs from 'fs'

// Config
/*
  URL : Url of minecraft-mp.com server
  ApiPort : Port Of API
  RefreshRate : Time update in (MS)
  AllowedUrl : use * for all, use example http://localhost for localhost only
*/
const config = {
  WebURL: "https://minecraft-mp.com",
  ApiPort: 2022,
  AllowedUrl: '*'
}

// Global Variable
let ServerProperties = {}

function getData(server) {
  return new Promise((resolve) => {
    fetch(`${config.WebURL}/${server}`)
      .then(async (Res) => {
        console.log(chalk.greenBright(`Success Get Properties of ${chalk.underline(chalk.blueBright(server))}`))
        let HtmlValue = `${await Res.text()}`;
        const srcProperty = HtmlValue.match(/src="(.*?)"/g)
        const strongProperties = HtmlValue.match(/<strong>(.*?)<\/strong>/g)
        const spanProperties = HtmlValue.match(/<span(.*?)>(.*?)<\/span>/g)
        const tdProperties = HtmlValue.match(/<td>(.*?)<\/td>/g)
        resolve({
          ApiStatus: `Succes get ${server}`,
          Name: HtmlValue.match(/<h1 class="text-break">(.*?)<\/h1>/g)[0].replace('<h1 class="text-break">', '').replace('</h1>', ''),
          Logo: ('https://minecraft-mp.com' + srcProperty[1].match(/src="(.*?)"/)[1]),
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
        })
      })
      .catch((Err) => {
        console.log(chalk.red(`Failed get ${chalk.underline(chalk.blueBright(server))}`))
        resolve({
          ApiStatus: `Failed get ${server}`
        })
      })
  })
}

const app = express()
app.use(cors({
  origin: config.AllowedUrl
}))

app.get('/:server', async (req, res) => {
  const { server } = req.params
  res.status(200).json(await getData(server))
})

app.listen(config.ApiPort, () => {
  console.log(chalk.greenBright(`Api Started at port ${config.ApiPort}`))
})

function checkUpdate() {
  fs.readFile('./package.json', 'utf-8', (err, res)=>{
    if (err) {
      console.error(chalk.red(err))
    } else {
      const packageValue = JSON.parse(res);
      const githubPackageUrl = (packageValue.homepage).replace('#readme', '').replace('github.com', 'raw.githubusercontent.com') + '/main/package.json';
      fetch(githubPackageUrl)
        .then((rawRes) => { return rawRes.json() })
        .then((res) => {
          if (packageValue.version !== res.version) {
            console.log(chalk.blue(`Update avabile for ${chalk.underline(chalk.blueBright(res.version))}`))
            console.log(chalk.blue(`Check Update on : ${(res.homepage).replace('#readme', '')}`))
          } else {
            console.log(chalk.blue('Your SC is UpToDate!!'))
          }
        })
        .catch(() => { console.log(chalk.red("Failed to check Updates")) })
    }
  })
}

checkUpdate()