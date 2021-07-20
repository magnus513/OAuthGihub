import express from 'express'
import cors from 'cors'
import config from '../config.js'
import fetch from 'node-fetch'
import qs from 'qs'
import JSONWebToken from 'jsonwebtoken'
import { async } from 'q'

const app = express()

app.use(cors())
app.use(express.json())

const userDatabase = []
app.post('/code', async function(req, res) {
    try {
        
        const token = await exchangeCodeForToken(req.body.token)
        console.log(token)
        const user = await fetchUser(token)
        const jwt = await encodeJWT(user, token)

        userDatabase.push({ jwt, user, token})

        const decoded = await verifyJWT(jwt, token)
        console.log(decoded)
        res.json( {jwt} )
    } catch (error) {
        console.log(error)
        res.send(error)
    }  
//    console.log(req.body)
//    res.json(req.body)
})

app.get('/repos', async function(req, res) {
    //console.log('Listening')
    try {
        const jwt = req.headers.authorization.split(' ')[1]
        const user = userDatabase.find(u => u.jwt === jwt)
        const token = user.token

        await verifyJWT(jwt, token)
        const repos = await fetchRepos(token)
        res.json(repos)

    } catch (error) {
        console.log(error)
        res.send(error)
    }
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

async function fetchUser(token) {
    const url = `${config.RESOURCE_ENDPOINT}/user`
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await res.json()
    return data
}

async function encodeJWT(user, token) {
    const jwtPayload = {
        login: user.login,
        id: user.id,
        avatar_url: user.avatar_url
    }
    return JSONWebToken.sign(jwtPayload, token, {expiresIn: '1h'})
}

async function verifyJWT(jwt, token) {
    return JSONWebToken.verify(jwt, token)
}

async function fetchRepos(token) {
    const url = `${config.RESOURCE_ENDPOINT}/user/repos?sort=created&direction=desc`
    const res= await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await res.json()
    return data
}