const express = require('express');
const fs = require('fs');
const path = require('path');
var cors = require('cors')

const app = express();
app.use(express.static('./../'))
app.use(cors())

const filename = './../traders.json';

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, filename))
})

app.post('/delete', (req, res) => {
    const address = req.query.address;

    fs.readFile(filename, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } 
        else {
            obj = JSON.parse(data);

            for(let n=0;n<obj.data.length;n++) {
                if(obj.data[n].address === address) {
                    obj.data[n].state = 2;
                    break;
                }
            }
            
            json = JSON.stringify(obj);
            fs.writeFile(filename, json, 'utf8', () => {});
        }
    });

    res.sendFile(path.join(__dirname, filename))
})

app.post('/include', (req, res) => {
    const address = req.query.address;

    fs.readFile(filename, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } 
        else {
            obj = JSON.parse(data);

            for(let n=0;n<obj.data.length;n++) {
                if(obj.data[n].address === address) {
                    obj.data[n].state = 0;
                    break;
                }
            }
            
            json = JSON.stringify(obj);
            fs.writeFile(filename, json, 'utf8', () => {});
        }
    });

    res.sendFile(path.join(__dirname, filename))
});

app.post('/save', (req, res) => {
    const address = req.query.address;

    fs.readFile(filename, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } 
        else {
            obj = JSON.parse(data);
            
            for(let n=0;n<obj.data.length;n++) {
                if(obj.data[n].address === address) {
                    obj.data[n].state = 1;
                    break;
                }
            }
            
            json = JSON.stringify(obj);
            fs.writeFile(filename, json, 'utf8', () => {});
        }
    });

    res.sendFile(path.join(__dirname, filename))
});

const port = 443;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`)
})