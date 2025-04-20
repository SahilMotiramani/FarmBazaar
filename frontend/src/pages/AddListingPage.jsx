import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Check, ArrowRight } from 'lucide-react';

export default function AddListingPage({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Crop Details
    cropName: '',
    cropVariety: '',
    cropCategory: '',
    quantity: '',
    quantityUnit: 'kg',
    expectedYieldDate: '',
    sowingDate: '',
    
    // Location Details
    address: '',
    state: '',
    district: '',
    village: '',
    pinCode: '',
    farmArea: '',
    areaUnit: 'acres',
    latitude: '',
    longitude: '',
    
    // Pricing & Contract Details
    expectedPrice: '',
    minPrice: '',
    requiresAdvance: false,
    advanceAmount: '',
    paymentMode: 'UPI',
    preferredBuyerType: 'Wholesaler',
    
    // Contract Terms
    contractDuration: '',
    deliveryResponsibility: 'Farmer',
    deliveryLocation: 'Farm',
    penaltyClauses: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    upiId: '',
    
    // Blockchain Smart Contract Details
    useSmartContract: false,
    walletAddress: '',
    preferredBlockchain: 'Polygon',
    escrowRequired: false,
    escrowPercentage: '10',
    automaticPayout: true,
    
    // Agreements
    agreeTerms: false,
    certifyDetails: false,
    allowVisibility: true,
    
    // Media
    images: [],
    idProof: null,
    landProof: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // For multi-step form

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...files].slice(0, 5) // Limit to 5 images
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data to FormData object
      for (const key in formData) {
        if (key === 'images') {
          formData.images.forEach((image) => {
            formDataToSend.append('images', image);
          });
        } else if (key === 'idProof' || key === 'landProof') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      }
      
      const response = await fetch('http://localhost:3000/api/v1/contracts', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/farmer-dashboard'), 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error creating listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-lg inline-flex items-center">
          <Check className="mr-2" size={24} />
          <h2 className="text-xl font-bold">Listing Created Successfully!</h2>
        </div>
        <p className="mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Step 1: Basic Listing Details
  if (currentStep === 1) {
    return (
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-2">Add New Listing</h1>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Crop Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Basic Crop Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name*</label>
                <input
                  type="text"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Variety</label>
                <input
                  type="text"
                  name="cropVariety"
                  value={formData.cropVariety}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Category*</label>
                <select
                  name="cropCategory"
                  value={formData.cropCategory}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Spices">Spices</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available*</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield/Harvest Date*</label>
                <input
                  type="date"
                  name="expectedYieldDate"
                  value={formData.expectedYieldDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date (Optional)</label>
                <input
                  type="date"
                  name="sowingDate"
                  value={formData.sowingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Location Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">📍 Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Farmer's Address*</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village*</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code*</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Area*</label>
                  <input
                    type="number"
                    name="farmArea"
                    value={formData.farmArea}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Pricing & Contract Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">💰 Pricing & Contract Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price per Unit*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="expectedPrice"
                    value={formData.expectedPrice}
                    onChange={handleChange}
                    required
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Acceptable Price*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleChange}
                    required
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresAdvance"
                  checked={formData.requiresAdvance}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Advance Payment Required?</label>
              </div>
              
              {formData.requiresAdvance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount (%)</label>
                  <input
                    type="number"
                    name="advanceAmount"
                    value={formData.advanceAmount}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment*</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Buyer Type*</label>
                <select
                  name="preferredBuyerType"
                  value={formData.preferredBuyerType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Exporter">Exporter</option>
                  <option value="Government">Government</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Contract Terms */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">📑 Contract Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Duration*</label>
                <input
                  type="text"
                  name="contractDuration"
                  value={formData.contractDuration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 3 months or until harvest"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Responsibility*</label>
                <select
                  name="deliveryResponsibility"
                  value={formData.deliveryResponsibility}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Buyer">Buyer</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location*</label>
                <select
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Farm">Farm</option>
                  <option value="Collection Center">Collection Center</option>
                  <option value="Buyer Location">Buyer Location</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Clauses (Optional)</label>
                <textarea
                  name="penaltyClauses"
                  value={formData.penaltyClauses}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe any penalty clauses for breach, delay, or non-payment"
                />
              </div>
            </div>
          </div>
          
          {/* Media Uploads */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">📷 Media Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop/Farm Images (Max 5)</label>
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-md border border-green-300 flex items-center">
                    <Upload className="mr-2" size={18} />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {formData.images.length} images selected
                  </span>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Crop ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farmer ID Proof/KYC Document*</label>
                <div className="mt-1">
                  <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-md border border-green-300 inline-flex items-center">
                    <Upload className="mr-2" size={18} />
                    Upload Document
                    <input
                      type="file"
                      name="idProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      required
                      className="hidden"
                    />
                  </label>
                  {formData.idProof && (
                    <span className="ml-3 text-sm text-gray-500">{formData.idProof.name}</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Ownership Proof (Optional)</label>
                <div className="mt-1">
                  <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-md border border-green-300 inline-flex items-center">
                    <Upload className="mr-2" size={18} />
                    Upload Document
                    <input
                      type="file"
                      name="landProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  {formData.landProof && (
                    <span className="ml-3 text-sm text-gray-500">{formData.landProof.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              Next <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Bank Details
  if (currentStep === 2) {
    return (
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-2">Add New Listing</h1>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bank Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">🏦 Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name*</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number*</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name*</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code*</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., name@upi"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md font-medium"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              Next <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Blockchain & Smart Contract Options
  if (currentStep === 3) {
    return (
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-2">Add New Listing</h1>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Blockchain Smart Contract Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">🔗 Blockchain Smart Contract Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="useSmartContract"
                  checked={formData.useSmartContract}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Enable Blockchain Smart Contract</label>
              </div>
              
              {formData.useSmartContract && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address*</label>
                    <input
                      type="text"
                      name="walletAddress"
                      value={formData.walletAddress}
                      onChange={handleChange}
                      required={formData.useSmartContract}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Blockchain*</label>
                    <select
                      name="preferredBlockchain"
                      value={formData.preferredBlockchain}
                      onChange={handleChange}
                      required={formData.useSmartContract}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Polygon">Polygon</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Binance Smart Chain">Binance Smart Chain</option>
                      <option value="Solana">Solana</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="escrowRequired"
                      checked={formData.escrowRequired}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Use Escrow Service?</label>
                  </div>
                  
                  {formData.escrowRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Percentage*</label>
                      <select
                        name="escrowPercentage"
                        value={formData.escrowPercentage}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                        <option value="25">25%</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="automaticPayout"
                      checked={formData.automaticPayout}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Enable Automatic Payout on Delivery</label>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Agreements */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">✅ Checkboxes & Agreements</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">I agree to the terms and conditions of FarmBazaar.</label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="certifyDetails"
                    checked={formData.certifyDetails}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">I certify that all the details provided are true to the best of my knowledge.</label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="allowVisibility"
                    checked={formData.allowVisibility}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Allow contract visibility to all buyers.</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Plus className="mr-2" size={18} />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }
}