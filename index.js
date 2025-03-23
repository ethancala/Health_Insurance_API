const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); 

const port = process.env.PORT || 3000;
const majorVersion = 1;
const minorVersion = 3;

// Serve static files
app.use(express.static(__dirname + '/static'));

// API Endpoints
app.get('/version', (req, res) => {
    console.log('Calling "/version" on the Node.js server.');
    res.type('text/plain').send(`Version: ${majorVersion}.${minorVersion}`);
});

app.get('/api/ping', (req, res) => {
    console.log('Calling "/api/ping"');
    res.type('text/plain').send('Server is awake!');
});

// Risk calculation API
app.post('/api/calculate-risk', (req, res) => {
    const { age, feet, inches, weight, systolic, diastolic, diseases } = req.body;

 // Log the inputs for debugging
    console.log("Received inputs:");
    console.log("Age:", age);
    console.log("Feet:", feet);
    console.log("Inches:", inches);
    console.log("Weight (lbs):", weight);
    console.log("Blood Pressure:", systolic, diastolic);
    console.log("Diseases:", diseases);


    // Ensure diseases is an array, even if it's empty
    const diseaseList = Array.isArray(diseases) ? diseases : [];

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
    if (bmi >= 18.5 && bmi <= 24.9) {
        bmiPoints = 0; // normal
    } else if (bmi >= 25.0 && bmi <= 29.9) {
        bmiPoints = 30; // overweight
    } else {
        bmiPoints = 75; // obese
    }

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
    const diseasePoints = diseaseList.length * 10;

    // Total score
    const totalScore = agePoints + bmiPoints + bpPoints + diseasePoints;

    // Log each category score for debugging
    console.log("Age Points:", agePoints);
    console.log("BMI Points:", bmiPoints);
    console.log("Blood Pressure Points:", bpPoints);
    console.log("Disease Points:", diseasePoints);
    console.log("Total Score:", totalScore);
    console.log("Blood Pressure Category:", bpCategory);

    // Risk category and suggestion based on the total score
    let riskCategory = '';
    let suggestion = '';

    if (totalScore <= 20) {
        riskCategory = 'Normal';
        suggestion = 'Maintain a healthy lifestyle.';
    } else if (totalScore <= 50) {
        riskCategory = 'Moderate Risk';
        suggestion = 'Consult a healthcare provider soon.';
    } else if (totalScore <= 75) {
        riskCategory = 'High Risk';
        suggestion = 'Seek medical attention as soon as possible.';
    } else {
        riskCategory = 'Uninsurable';
        suggestion = 'Seek immediate medical care and consider insurance options.';
    }

    // Return the risk level and suggestion
    res.json({ risk_level: riskCategory, suggestion });
});



// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
