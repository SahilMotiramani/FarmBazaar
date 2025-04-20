from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model and features
model = joblib.load('crop_yield_model.pkl')
model_features = joblib.load('model_features.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # input JSON
    input_df = pd.DataFrame([data])
    
    # Convert categorical fields to dummy variables and match model input
    input_df = pd.get_dummies(input_df)
    input_df = input_df.reindex(columns=model_features, fill_value=0)

    prediction = model.predict(input_df)[0]
    return jsonify({'predicted_yield': prediction})

if __name__ == '__main__':
    app.run(debug=True)
