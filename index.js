const express = require('express')
app = express()
app.use(express.json());

const cors = require("cors")

var url = require('url');
var dt = require('./date-time');

const port = process.env.PORT || 3000
const majorVersion = 1
const minorVersion = 3

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: '*' }))

// The app.get functions below are being processed in Node.js running on the server.
app.get('/version', (request, response) => {
	console.log('Calling "/version" on the Node.js server.')
	response.type('text/plain')
	response.send('Version: '+majorVersion+'.'+minorVersion)
})

app.get('/api/ping', (request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send('ping response')
})

// // Custom 404 page.
// app.use((request, response) => {
//   response.type('text/plain')
//   response.status(404)
//   response.send('404 - Not Found')
// })

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})


// Ping API to wake server
app.get('/api/ping', (req, res) => {
    res.send('Server is awake!');
});

// Risk calculation API
app.post('/api/calculate-risk', (req, res) => {
    const { age, feet, inches, weight, systolic, diastolic, diseases } = req.body;

    // Calculate BMI (convert to metric)
    const totalInches = (feet * 12) + inches;
    const heightMeters = totalInches * 0.0254; // inches to meters
    const weightKg = weight * 0.453592; // pounds to kg
    const bmi = weightKg / (heightMeters * heightMeters);

    // Age points
    let agePoints = 0;
    if (age < 38) agePoints = 0;
    else if (age < 45) agePoints = 10;
    else if (age < 60) agePoints = 20;
    else agePoints = 30;

    // BMI points
    let bmiPoints = 0;
    if (bmi >= 18.5 && bmi <= 24.9) bmiPoints = 0; // normal
    else if (bmi >= 25.0 && bmi <= 29.9) bmiPoints = 30; // overweight
    else bmiPoints = 75; // obese

    // Blood Pressure points and category
    let bpPoints = 0;
    let bpCategory = '';
    if (systolic > 180 || diastolic > 120) {
        bpPoints = 100;
        bpCategory = 'Crisis';
    } else if (systolic >= 140 || diastolic >= 90) {
        bpPoints = 75;
        bpCategory = 'Stage 2';
    } else if (systolic >= 130 || diastolic >= 80) {
        bpPoints = 30;
        bpCategory = 'Stage 1';
    } else if (systolic >= 120) {
        bpPoints = 15;
        bpCategory = 'Elevated';
    } else {
        bpPoints = 0;
        bpCategory = 'Normal';
    }

    // Family disease points
    const diseasePoints = diseases.length * 10;

    // Total score
    const totalScore = agePoints + bmiPoints + bpPoints + diseasePoints;

    // Risk category
    let riskCategory = '';
    if (totalScore <= 20) riskCategory = 'Low Risk';
    else if (totalScore <= 50) riskCategory = 'Moderate Risk';
    else if (totalScore <= 75) riskCategory = 'High Risk';
    else riskCategory = 'Uninsurable';

    // Response
    res.json({
        agePoints,
        bmi,
        bmiPoints,
        bpCategory,
        bpPoints,
        diseasePoints,
        totalScore,
        riskCategory
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
