import express from 'express'
import cors from 'cors'
import { async } from 'q'
import config from '../config.js'
import fetch from 'node-fetch'
import qs from 'qs'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/code', async function(req, res) {
    try {
        
        const token = await exchangeCodeForToken(req.body.token)
        console.log(token)
    } catch (error) {
        console.log(error)
        res.send(error)
    }  
//    console.log(req.body)
//    res.json(req.body)
})

app.listen(1234, function() {
    console.log('Listening')
} )

async function exchangeCodeForToken(code) {
    const tokenUrl = config.TOKEN_ENDPOINT
    const oAuthQueryParams = {
        grant_type: 'authorization_code',
        redirect_uri: config.REDIRECT_URL,
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        code: code
    }

    const res = await fetch(tokenUrl, {
        body: JSON.stringify(oAuthQueryParams),
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })

    const data = await res.text()
    const parsedData = qs.parse(data)
    return parsedData.access_token
}