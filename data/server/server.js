const express = require('express');
// const fs = require('fs');
const path = require('path');
var cors = require('cors')

const app = express();
app.use(express.static('./../'))
app.use(cors())

app.get('/traders', (req, res) => {
    res.sendFile(path.join(__dirname,'./../traders.json'))
})

const port = 443;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`)
})