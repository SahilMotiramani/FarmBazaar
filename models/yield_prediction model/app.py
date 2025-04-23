from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import google.generativeai as genai
from PIL import Image
import os

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
    Analyze this {plant_type} plant image for diseases. Provide a detailed report with the following sections:
    
    1. DISEASE IDENTIFICATION: Identify the specific disease with scientific name
    2. SYMPTOMS: List all visible symptoms and affected plant parts
    3. SEVERITY: Rate severity (Mild/Moderate/Severe) and explain why
    4. CAUSE: Explain what causes this disease (fungus, bacteria, virus, nutrient deficiency, etc.)
    5. TREATMENT RECOMMENDATIONS: Provide specific treatments including cultural, chemical, and organic options
    6. PREVENTIVE MEASURES: How to prevent this disease in the future
    7. RECOVERY TIMELINE: Expected recovery time with proper treatment
    8. ADDITIONAL NOTES: Any other important information for this specific condition
    
    Format the response in clear sections with headings. If the plant appears healthy, state that and provide general care tips.
    """
    
    response = gemini_model.generate_content([prompt, image])
    
    # Process and structure the response
    result = response.text
    
    return jsonify({
        'result': result,
        'plantType': plant_type
    })

if __name__ == '__main__':
    app.run(debug=True)