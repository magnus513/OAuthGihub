import { json } from 'body-parser'
import fetch from 'node-fetch'
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

function protectedRequest() {
    const requestButton = document.querySelector('button')
    requestButton.style.display = 'none'

    if(localStorage.getItem('jwt')) {
        requestButton.style.display = 'block'
        requestButton.addEventListener('click', function() {
            fetchRepos()
        })
    }

    async function fetchRepos() {
        const server = 'http://localhost:1235/repos'
        try {
            const res = await fetch(server, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt')}`
                }
            })

            const data = await res.json()
            console.log(data)

        } catch (error) {
            console.log(error)
        }
    }

}

window.onload = function() {
    askForConsent()
    handleCode()
    protectedRequest()
}