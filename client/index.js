import { json } from 'body-parser'
import { async } from 'q'
import qs from 'query-string'
import config from '../config.js'

function askForConsent() {
    const oAuthQueryParams = {
        response_type: 'code',
        scope: 'user public_repo',
        redirect_uri: config.REDIRECT_URL,
        client_id: config.CLIENT_ID,
        state: 'blabla'
    }
}

function handleCode() {
    const parsedQuery = qs.parseUrl(window.location.href)

    if( parsedQuery.query.code ) {
        sendCodeToServer()
    }

    async function sendCodeToServer() {
        const server = "http://localhost:1235/code"
        try {
            const res = await fetch(server, {
                method: 'POST',
                body: JSON.stringify( {
                    code: parsedQuery.query.code,
                    state: parsedQuery.query.state
                } ),
                headers: {
                    'Content-Type': 'application/json'
                }
            } )

            const data = await res.json()
            console.log(data)
            localStorage.setItem('jwt', data.jwt)
            // jwt.io
            window.location.href = config.REDIRECT_URL

        } catch (error) {
            console.log(console.error())
        }
    }

}

//const query = qs.stringify(oAuthQueryParams)
//const authorizationUrl = `${config.AUTHORIZATION_ENDPOINT}?${query}`
//const loginLinkEl = document.querySelector('a')
//loginLinkEl.setAttribute('href', authorizationUrl)

window.onload = function() {
    askForConsent()
    handleCode()
}