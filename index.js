const path = require('path');
const express = require('express');
const methodOverride = require('method-override')
const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid');
const app = express();
const dot = require('dotenv').config();

let prompt;
let output;

let responses = [
    {
        id: uuidv4(),
        name: "testname1",
        job: "testjob1",
        resume: `testresume1`,
        listing: `testlisting1`
    },
    {
        id: 5,
        name: 'testname2',
        job: 'testjob2',
        resume: 'testresume2',
        listing: 'testlisting2'
    }
]

function searchString(str) {
    let i = 0;
    while (i < str.length) {
        if (str[i] === 'D' && str[i += 1] === 'e' && str[i += 1] === 'a' && str[i += 1] === 'r') {
            break;
        }
        else {
            i++;
        }
    }
    return i - 3;
}



app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/start', (req, res) => {
    res.render('start');
})

app.post('/start', (req, res) => {
    let generatedId = uuidv4();
    const { name, job, resume, listing } = req.body;
    responses.push({ name, job, resume, listing, id: generatedId })
    res.redirect(`start/${generatedId}`);
})

app.get('/start/:id', (req, res) => {
    const { id } = req.params;
    const response = responses.find(c => c.id === id);
    console.log(response);

    let applicantName = response.name.replace(/\W/g, ' ');
    let resumeText = response.resume.replace(/\W/g, ' ');
    let job = response.job.replace(/\W/g, ' ');
    let listing = response.listing.replace(/\W/g, ' ');

    prompt = `{"model": "text-davinci-003", "prompt": "Write a cover letter for ${applicantName} whose resume is below: ${resumeText} who is applying for the ${job} position listed below: ${listing}", "temperature": 0.3, "max_tokens": 2000}`

    if(response.output===undefined){
        fetch("https://api.openai.com/v1/completions", {
            body: prompt,
            headers: {
                Authorization: `Bearer ${process.env.key}`,
                "Content-Type": "application/json"
            },
            method: "POST"
        })
            .then(function (res) {
                console.log(res);
                return res.json();
            }).then(function (data) {
                console.log(data);
                output = data.choices[0].text.slice(searchString(data.choices[0].text));
                console.log(output);
    
                response.output = output;
    
    
                res.render('show', { response });
            })
            .catch(function (error) {
                console.log(error.message);
            });
    }
    else{
        console.log(response);
        console.log("AAAAAAAAAAAAAAAAAAAAAAA");
        res.render('show', { response });
    }

})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));