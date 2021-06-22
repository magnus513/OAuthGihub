import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/code', function(req, res) {
    res.json(req.body)
})

app.listen(1234, function() {
    console.log('Listning')
}

)