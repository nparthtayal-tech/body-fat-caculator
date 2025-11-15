// Unit toggle functionality
const unitButtons = document.querySelectorAll('.unit-btn');
const metricInputs = document.getElementById('metric-inputs');
const imperialInputs = document.getElementById('imperial-inputs');

unitButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        unitButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const unit = this.getAttribute('data-unit');
        if (unit === 'metric') {
            metricInputs.style.display = 'grid';
            imperialInputs.style.display = 'none';
        } else {
            metricInputs.style.display = 'none';
            imperialInputs.style.display = 'grid';
        }
    });
});

// Gender change handler to show/hide hip measurement
const genderSelect = document.getElementById('gender');
const hipGroup = document.getElementById('hip-group');
const hipGroupIn = document.getElementById('hip-group-in');

genderSelect.addEventListener('change', function() {
    // Hip measurement is used for women only
    if (this.value === 'female') {
        hipGroup.style.display = 'block';
        hipGroupIn.style.display = 'block';
    } else {
        hipGroup.style.display = 'none';
        hipGroupIn.style.display = 'none';
    }
});

// Form submission
const form = document.getElementById('bodyFatForm');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateBodyFat();
});

function calculateBodyFat() {
    const gender = document.getElementById('gender').value;
    const age = parseFloat(document.getElementById('age').value);
    
    // Check which unit system is active
    const activeUnit = document.querySelector('.unit-btn.active').getAttribute('data-unit');
    
    let height, weight, neck, waist, hip;
    
    if (activeUnit === 'metric') {
        height = parseFloat(document.getElementById('height').value);
        weight = parseFloat(document.getElementById('weight').value);
        neck = parseFloat(document.getElementById('neck').value);
        waist = parseFloat(document.getElementById('waist').value);
        hip = gender === 'female' ? parseFloat(document.getElementById('hip').value) : 0;
    } else {
        // Convert imperial to metric
        height = parseFloat(document.getElementById('height-in').value) * 2.54;
        weight = parseFloat(document.getElementById('weight-lb').value) * 0.453592;
        neck = parseFloat(document.getElementById('neck-in').value) * 2.54;
        waist = parseFloat(document.getElementById('waist-in').value) * 2.54;
        hip = gender === 'female' ? parseFloat(document.getElementById('hip-in').value) * 2.54 : 0;
    }
    
    // Validate inputs
    if (!height || !weight || !neck || !waist) {
        alert('Please fill in all required measurements');
        return;
    }
    
    if (gender === 'female' && !hip) {
        alert('Please enter hip measurement for women');
        return;
    }
    
    // Calculate body fat percentage using U.S. Navy formula
    let bodyFatPercent;
    
    if (gender === 'male') {
        // Navy formula for men: BF% = 86.010 x log10(waist - neck) - 70.041 x log10(height) + 36.76
        bodyFatPercent = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
        // Navy formula for women: BF% = 163.205 x log10(waist + hip - neck) - 97.684 x log10(height) - 78.387
        bodyFatPercent = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    }
    
    // Ensure reasonable values
    bodyFatPercent = Math.max(2, Math.min(bodyFatPercent, 60));
    
    // Calculate BMI
    const bmi = weight / ((height / 100) ** 2);
    
    // Calculate Lean Body Mass and Fat Mass
    const fatMass = (weight * bodyFatPercent) / 100;
    const leanBodyMass = weight - fatMass;
    
    // Determine categories
    const bodyFatCategory = getBodyFatCategory(gender, bodyFatPercent);
    const bmiCategory = getBMICategory(bmi);
    
    // Display results
    displayResults(bodyFatPercent, bmi, leanBodyMass, fatMass, bodyFatCategory, bmiCategory, activeUnit);
}

function getBodyFatCategory(gender, bodyFat) {
    if (gender === 'male') {
        if (bodyFat < 6) return 'Essential Fat';
        if (bodyFat < 14) return 'Athletes';
        if (bodyFat < 18) return 'Fitness';
        if (bodyFat < 25) return 'Average';
        return 'Obese';
    } else {
        if (bodyFat < 14) return 'Essential Fat';
        if (bodyFat < 21) return 'Athletes';
        if (bodyFat < 25) return 'Fitness';
        if (bodyFat < 32) return 'Average';
        return 'Obese';
    }
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function displayResults(bodyFat, bmi, lbm, fatMass, bodyFatCat, bmiCat, unit) {
    const resultsSection = document.getElementById('results');
    const weightUnit = unit === 'metric' ? 'kg' : 'lbs';
    
    document.getElementById('bodyFatResult').textContent = bodyFat.toFixed(1) + '%';
    document.getElementById('categoryResult').textContent = bodyFatCat;
    
    document.getElementById('bmiResult').textContent = bmi.toFixed(1);
    document.getElementById('bmiCategoryResult').textContent = bmiCat;
    
    document.getElementById('lbmResult').textContent = lbm.toFixed(1);
    document.getElementById('lbmUnitResult').textContent = weightUnit;
    
    document.getElementById('fatMassResult').textContent = fatMass.toFixed(1);
    document.getElementById('fatMassUnitResult').textContent = weightUnit;
    
    resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Initialize: show only required fields for male
document.getElementById('hip-group').style.display = 'none';
document.getElementById('hip-group-in').style.display = 'none';
