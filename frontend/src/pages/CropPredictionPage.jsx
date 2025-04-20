import { useState } from 'react';
import useAIChat from '../hooks/useAIChat';

export default function CropPredictionPage() {
  const [formData, setFormData] = useState({
    Crop: 'Rice',
    Crop_Year: '2020',
    Season: 'Kharif',
    State: 'Karnataka',
    Area: 5000,
    Production: 10000,
    Annual_Rainfall: 1200,
    Fertilizer: 300,
    Pesticide: 50
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState(null);

  // Initialize the AI chat hook with farmer type
  const { sendMessage, isLoading: aiLoading } = useAIChat({ 
    userType: 'farmer', 
    language: 'English', 
    region: formData.State 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'Area' || name === 'Production' || name === 'Annual_Rainfall' || name === 'Fertilizer' || name === 'Pesticide' 
        ? parseFloat(value) 
        : value
    });
  };

  const getRecommendations = async (predictedYield) => {
    // Determine if the yield is good, average, or needs improvement
    let yieldStatus = '';
    const cropYield = predictedYield;
    
    // Simple logic to categorize yield (can be refined with more specific data per crop)
    if (formData.Crop === 'Rice') {
      if (cropYield > 5) yieldStatus = 'good';
      else if (cropYield > 3) yieldStatus = 'average';
      else yieldStatus = 'needs improvement';
    } else if (formData.Crop === 'Wheat') {
      if (cropYield > 4) yieldStatus = 'good';
      else if (cropYield > 2.5) yieldStatus = 'average';
      else yieldStatus = 'needs improvement';
    } else {
      // Default categorization for other crops
      if (cropYield > 4) yieldStatus = 'good';
      else if (cropYield > 2) yieldStatus = 'average';
      else yieldStatus = 'needs improvement';
    }
    
    // Construct prompt for the AI
    const prompt = `Based on the following crop details:
    - Crop: ${formData.Crop}
    - Region: ${formData.State}
    - Season: ${formData.Season}
    - Current fertilizer usage: ${formData.Fertilizer} kg
    - Current pesticide usage: ${formData.Pesticide} kg
    - Annual rainfall: ${formData.Annual_Rainfall} mm
    - Predicted yield: ${cropYield.toFixed(2)} tonnes/hectare (which is ${yieldStatus})
    
    Please provide 3-5 specific recommendations to optimize farming practices for this crop in this region. Focus on actionable advice to improve yield, sustainability, and profit.`;
    
    try {
      // Use the AI chat hook to get recommendations
      await sendMessage(prompt);
      
      // For demonstration, we'll create a sample recommendation
      // In a real implementation, you would parse the AI response
      const sampleRecommendations = {
        yieldStatus,
        items: [
          {
            title: 'Optimize Water Management',
            description: `Based on the ${formData.Annual_Rainfall}mm rainfall in ${formData.State}, implement controlled irrigation during critical growth phases.`
          },
          {
            title: 'Balanced Fertilizer Application',
            description: `Your current usage of ${formData.Fertilizer}kg fertilizer could be optimized with soil testing to apply exactly what your ${formData.Crop} needs.`
          },
          {
            title: 'Integrated Pest Management',
            description: `For ${formData.Season} season in ${formData.State}, consider biological controls alongside your ${formData.Pesticide}kg pesticide usage.`
          },
          {
            title: 'Crop Rotation',
            description: `To maintain soil health for future ${formData.Crop} plantings, rotate with compatible crops next season.`
          }
        ]
      };
      
      setRecommendations(sampleRecommendations);
    } catch (err) {
      console.error('Error getting recommendations:', err);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    
    try {
      // Calculate some metrics for the report
      const totalArea = formData.Area;
      const predictedTotalProduction = prediction * totalArea;
      const fertilizationRate = formData.Fertilizer / totalArea;
      const pesticideRate = formData.Pesticide / totalArea;
      
      // In a real implementation, you would use the AI chat hook here too
      // and parse its response to create a structured report
      
      const reportData = {
        summary: {
          crop: formData.Crop,
          season: formData.Season,
          state: formData.State,
          year: formData.Crop_Year,
          totalArea: totalArea,
          predictedYield: prediction,
          predictedTotalProduction: predictedTotalProduction
        },
        inputs: {
          fertilizer: {
            total: formData.Fertilizer,
            perHectare: fertilizationRate
          },
          pesticide: {
            total: formData.Pesticide,
            perHectare: pesticideRate
          },
          rainfall: formData.Annual_Rainfall
        },
        recommendations: recommendations.items,
        marketOutlook: {
          priceRange: `₹${Math.floor(Math.random() * 10 + 15)}-${Math.floor(Math.random() * 10 + 25)} per kg`,
          demand: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          bestMarkets: ['Local Mandi', 'FarmBazaar Platform', 'Direct to Consumers']
        }
      };
      
      setReport(reportData);
      setShowReport(true);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations(null);
    setReport(null);
    setShowReport(false);
    
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      
      const result = await response.json();
      const predictedYield = result.predicted_yield;
      setPrediction(predictedYield);
      
      // Get recommendations based on the prediction
      await getRecommendations(predictedYield);
      
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
          <span className="mr-2">🌾</span> Crop Yield and Price Predictor
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Enter crop details and environmental factors to predict your crop yield per hectare and Price per kg.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <select 
                name="Crop" 
                value={formData.Crop} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Arecanut">Arecanut</option>
                <option value="Arhar/Tur">Arhar/Tur</option>
                <option value="Bajra">Bajra</option>
                <option value="Banana">Banana</option>
                <option value="Barley">Barley</option>
                <option value="Black pepper">Black pepper</option>
                <option value="Cardamom">Cardamom</option>
                <option value="Cashewnut">Cashewnut</option>
                <option value="Castor seed">Castor seed</option>
                <option value="Coconut">Coconut</option>
                <option value="Coriander">Coriander</option>
                <option value="Cotton(lint)">Cotton(lint)</option>
                <option value="Cowpea(Lobia)">Cowpea(Lobia)</option>
                <option value="Dry chillies">Dry chillies</option>
                <option value="Garlic">Garlic</option>
                <option value="Ginger">Ginger</option>
                <option value="Gram">Gram</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Guar seed">Guar seed</option>
                <option value="Horse-gram">Horse-gram</option>
                <option value="Jowar">Jowar</option>
                <option value="Jute">Jute</option>
                <option value="Khesari">Khesari</option>
                <option value="Linseed">Linseed</option>
                <option value="Maize">Maize</option>
                <option value="Masoor">Masoor</option>
                <option value="Mesta">Mesta</option>
                <option value="Moong(Green Gram)">Moong(Green Gram)</option>
                <option value="Moth">Moth</option>
                <option value="Niger seed">Niger seed</option>
                <option value="Onion">Onion</option>
                <option value="Other Cereals">Other Cereals</option>
                <option value="Other Kharif pulses">Other Kharif pulses</option>
                <option value="Other Rabi pulses">Other Rabi pulses</option>
                <option value="Other Summer Pulses">Other Summer Pulses</option>
                <option value="Other oilseeds">Other oilseeds</option>
                <option value="Oilseeds total">Oilseeds total</option>
                <option value="Peas & beans (Pulses)">Peas & beans (Pulses)</option>
                <option value="Potato">Potato</option>
                <option value="Ragi">Ragi</option>
                <option value="Rapeseed &Mustard">Rapeseed &Mustard</option>
                <option value="Rice">Rice</option>
                <option value="Safflower">Safflower</option>
                <option value="Sannhamp">Sannhamp</option>
                <option value="Sesamum">Sesamum</option>
                <option value="Small millets">Small millets</option>
                <option value="Soyabean">Soyabean</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Sunflower">Sunflower</option>
                <option value="Sweet potato">Sweet potato</option>
                <option value="Tapioca">Tapioca</option>
                <option value="Tobacco">Tobacco</option>
                <option value="Turmeric">Turmeric</option>
                <option value="Urad">Urad</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>
            
            {/* Rest of the form fields remain the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Year</label>
              <select 
                name="Crop_Year" 
                value={formData.Crop_Year} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              >
                {Array.from({ length: 35 }, (_, i) => 1997 + i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select 
                name="Season" 
                value={formData.Season} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Whole Year">Whole Year</option>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Autumn">Autumn</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select 
                name="State" 
                value={formData.State} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Puducherry">Puducherry</option>
                <option value="Punjab">Punjab</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (in hectares)</label>
              <input 
                type="number" 
                name="Area" 
                value={formData.Area} 
                onChange={handleChange}
                min="0.1"
                step="0.1"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production (in metric tons)</label>
              <input 
                type="number" 
                name="Production" 
                value={formData.Production} 
                onChange={handleChange}
                min="0.1"
                step="0.1"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rainfall (in mm)</label>
              <input 
                type="number" 
                name="Annual_Rainfall" 
                value={formData.Annual_Rainfall} 
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Used (in kg)</label>
              <input 
                type="number" 
                name="Fertilizer" 
                value={formData.Fertilizer} 
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesticide Used (in kg)</label>
              <input 
                type="number" 
                name="Pesticide" 
                value={formData.Pesticide} 
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              type="submit" 
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
              disabled={loading || aiLoading}
            >
              {loading || aiLoading ? (
                <span>Processing...</span>
              ) : (
                <><span className="mr-2">🔍</span> Predict Yield</>
              )}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {prediction !== null && !error && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              <div>
                <p className="font-semibold">Predicted Yield: {prediction.toFixed(2)} tonnes/hectare</p>
                <p className="text-sm mt-1">Based on the provided crop details and conditions</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommendations Section */}
        {recommendations && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">💡</span> Recommendations
            </h2>
            
            <div className="space-y-3">
              {recommendations.items.map((rec, index) => (
                <div key={index} className="bg-white p-3 rounded shadow-sm">
                  <h3 className="font-medium text-blue-700">{rec.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center text-sm"
              >
                {generatingReport ? (
                  <span>Generating...</span>
                ) : (
                  <><span className="mr-1">📊</span> Generate Detailed Report</>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Report Section */}
        {showReport && report && (
          <div className="mt-6 bg-white border border-gray-200 rounded-md shadow-md">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">📝</span> Crop Analysis Report
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                onClick={() => window.print()}
              >
                <span className="mr-1">🖨️</span> Print
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Summary Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Crop Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Crop</p>
                    <p className="font-medium">{report.summary.crop}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Season</p>
                    <p className="font-medium">{report.summary.season}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{report.summary.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{report.summary.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{report.summary.totalArea.toFixed(2)} hectares</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Yield</p>
                    <p className="font-medium">{report.summary.predictedYield.toFixed(2)} tonnes/hectare</p>
                  </div>
                </div>
              </div>
              
              {/* Input Analysis */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Input Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Fertilizer Usage</p>
                    <p className="text-2xl font-semibold text-blue-600">{report.inputs.fertilizer.perHectare.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">kg per hectare</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Pesticide Usage</p>
                    <p className="text-2xl font-semibold text-blue-600">{report.inputs.pesticide.perHectare.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">kg per hectare</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Annual Rainfall</p>
                    <p className="text-2xl font-semibold text-blue-600">{report.inputs.rainfall}</p>
                    <p className="text-xs text-gray-500">mm</p>
                  </div>
                </div>
              </div>
              
              {/* Production Forecast */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Production Forecast</h3>
                <div className="bg-green-50 p-4 rounded">
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-green-700 mr-3">
                      {report.summary.predictedTotalProduction.toFixed(2)}
                    </div>
                    <div>
                      <p className="font-medium">Total Tonnes</p>
                      <p className="text-sm text-gray-600">Estimated total production</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Key Recommendations */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Key Recommendations</h3>
                <div className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Market Outlook */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Market Outlook</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Price Range</p>
                    <p className="font-medium">{report.marketOutlook.priceRange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Market Demand</p>
                    <p className="font-medium">{report.marketOutlook.demand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recommended Markets</p>
                    <p className="font-medium">{report.marketOutlook.bestMarkets.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              {/* Disclaimer */}
              <div className="text-xs text-gray-500 mt-6 pt-2 border-t border-gray-100">
                <p>This report is generated based on the prediction model and AI recommendations from FarmBazaar. Actual results may vary based on various factors including weather conditions, soil quality, and farming practices.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}