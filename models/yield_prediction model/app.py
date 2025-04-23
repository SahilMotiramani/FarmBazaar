from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import google.generativeai as genai
from PIL import Image
import os
import re

genai.configure(api_key="AIzaSyDIQbk9dHbTrcnyUBlUfK2B9thI9g0uA04")

# Rename the Gemini model to avoid conflict
gemini_model = genai.GenerativeModel(model_name="models/gemini-1.5-pro")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load crop yield model and features with different variable names
crop_yield_model = joblib.load('crop_yield_model.pkl')
model_features = joblib.load('model_features.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # input JSON
    input_df = pd.DataFrame([data])
    
    # Convert categorical fields to dummy variables and match model input
    input_df = pd.get_dummies(input_df)
    input_df = input_df.reindex(columns=model_features, fill_value=0)

    prediction = crop_yield_model.predict(input_df)[0]
    return jsonify({'predicted_yield': prediction})

@app.route('/predictdisease', methods=['POST'])
def predictdisease():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    plant_type = request.form.get('plantType', 'unknown')

    image = Image.open(filepath)
    
    # Enhanced prompt for more detailed disease analysis
    prompt = f"""
    Analyze this {plant_type} plant image for diseases. Provide a detailed report with the following numbered sections:
    
    1. DISEASE IDENTIFICATION: 
    - Identify the specific disease with scientific name
    - Common name of the disease
    - Affected plant parts
    
    2. SYMPTOMS: 
    - List all visible symptoms (5-7 items)
    - Describe symptom progression
    
    3. SEVERITY: 
    - Rate severity (Mild/Moderate/Severe) 
    - Explain the rating
    - Potential impact on yield
    
    4. CAUSE: 
    - Pathogen type (fungus, bacteria, virus, etc.)
    - Environmental contributing factors
    - Common transmission methods
    
    5. TREATMENT RECOMMENDATIONS:
    - Immediate actions (3-5 steps)
    - Chemical treatments (if applicable)
    - Organic/natural treatments
    - Application methods
    
    6. PREVENTIVE MEASURES:
    - Cultural practices
    - Environmental controls
    - Monitoring techniques
    - Resistant varieties
    
    7. RECOVERY TIMELINE:
    - Expected recovery time with treatment
    - Key recovery milestones
    - Signs of improvement
    
    8. ADDITIONAL NOTES:
    - Any special considerations
    - When to consult an expert
    - Regional specific advice
    
    Format each section clearly with the numbered heading followed by bullet points. 
    Use simple language but include scientific terms where appropriate.
    If the plant appears healthy, state that and provide general care tips.
    """
    
    response = gemini_model.generate_content([prompt, image])
    
    # Process and structure the response
    result = response.text
    
    # Clean up the response
    result = re.sub(r'\*\*', '', result)  # Remove markdown bold
    result = re.sub(r'^\-', '*', result, flags=re.MULTILINE)  # Standardize bullets
    
    return jsonify({
        'result': result,
        'plantType': plant_type
    })

if __name__ == '__main__':
    app.run(debug=True)