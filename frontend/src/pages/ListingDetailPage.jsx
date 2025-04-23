import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Package, DollarSign, Truck, Clock, 
  Users, FileText, AlertCircle, X, ChevronLeft, 
  ChevronRight, Maximize, Check, Loader2, Wallet 
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  
  // Contract form state
  const [contractFormVisible, setContractFormVisible] = useState(false);
  const [contractForm, setContractForm] = useState({
    quantity: '',
    agreedPrice: '',
    deliveryDate: '',
    buyerWalletAddress: '',
    acceptTerms: false,
    useEscrow: false,
    escrowPercentage: '10'
  });
  
  // Blockchain transaction state
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/contracts/${id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setListing(data.contract);
          // Initialize contract form with listing details
          setContractForm(prev => ({
            ...prev,
            quantity: data.contract.quantity,
            agreedPrice: data.contract.expectedPrice,
            deliveryDate: data.contract.expectedYieldDate.split('T')[0]
          }));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch listing details');
        }
      } catch (error) {
        console.error('Error fetching listing details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListingDetails();
  }, [id]);

  // Connect to wallet (simplified for demo)
  const connectWallet = async () => {
    try {
      // In a real app, you would use Web3Modal or similar to connect to MetaMask
      // This is a simplified version for demonstration
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      setContractForm(prev => ({
        ...prev,
        buyerWalletAddress: mockAddress
      }));
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet');
    }
  };

  const handleContractFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContractForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setTransactionStatus('processing');
      
      // Validate form
      if (!contractForm.acceptTerms) {
        throw new Error('You must accept the terms and conditions');
      }
      
      if (parseFloat(contractForm.quantity) > listing.quantity) {
        throw new Error('Requested quantity exceeds available quantity');
      }
      
      if (parseFloat(contractForm.agreedPrice) < listing.minPrice) {
        throw new Error(`Price must be at least ₹${listing.minPrice} per ${listing.quantityUnit}`);
      }
      
      if (listing.useSmartContract && !walletConnected) {
        throw new Error('Please connect your wallet first');
      }
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);
      
      // Send contract details to backend
      const response = await fetch(`http://localhost:3000/api/v1/contracts/${id}/create-agreement`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contractForm,
          txHash: mockTxHash,
          buyerWalletAddress: contractForm.buyerWalletAddress,
          farmerWalletAddress: listing.walletAddress,
          blockchain: listing.preferredBlockchain
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save contract details');
      }
      
      setTransactionStatus('success');
      
      // Redirect to contract view after 3 seconds
      setTimeout(() => {
        navigate(`/contracts/${id}`);
      }, 3000);
      
    } catch (err) {
      console.error('Error creating contract:', err);
      setTransactionStatus('error');
      alert(err.message);
    }
  };

  // Image handling functions
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleFullscreen = () => {
    setFullscreenImage(!fullscreenImage);
  };

  if (loading) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4">Loading listing details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg inline-block">
          <p>Listing not found</p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="mt-2 bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/marketplace')}
        className="mb-6 text-green-700 hover:underline flex items-center"
      >
        ← Back to Marketplace
      </button>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left column - Images and main details */}
          <div className="lg:col-span-2 p-6 lg:border-r border-gray-200">
            {/* Image gallery */}
            <div className="mb-6 relative group">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <div className="relative h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={`http://localhost:3000/${listing.images[currentImageIndex]}`} 
                      alt={`${listing.cropName} - ${currentImageIndex + 1}`}
                      className="h-full w-full object-cover"
                      onClick={toggleFullscreen}
                    />
                    
                    {/* Navigation arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); prevImage(); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); nextImage(); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                    
                    {/* Fullscreen button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <Maximize size={20} />
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail navigation */}
                  {listing.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto py-2">
                      {listing.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-green-500' : 'border-transparent'}`}
                        >
                          <img 
                            src={`http://localhost:3000/${img}`} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No images available</span>
                </div>
              )}
            </div>
            
            {/* Header with status */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-green-700">{listing.cropName}</h1>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {listing.status}
              </span>
            </div>
            
            <p className="text-lg text-gray-600 mb-6">
              {listing.cropVariety} • {listing.cropCategory}
            </p>
            
            {/* Key details in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Quantity Available</p>
                    <p className="font-medium">{listing.quantity} {listing.quantityUnit}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Expected Harvest</p>
                    <p className="font-medium">{new Date(listing.expectedYieldDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Sowing Date</p>
                    <p className="font-medium">
                      {listing.sowingDate ? new Date(listing.sowingDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Expected Price</p>
                    <p className="font-medium">₹{listing.expectedPrice} per {listing.quantityUnit}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Minimum Price</p>
                    <p className="font-medium">₹{listing.minPrice} per {listing.quantityUnit}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="mr-2 text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{listing.village}, {listing.district}, {listing.state}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Farm Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{listing.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pin Code</p>
                  <p>{listing.pinCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farm Area</p>
                  <p>{listing.farmArea} {listing.areaUnit}</p>
                </div>
                {listing.useSmartContract && (
                  <div>
                    <p className="text-sm text-gray-500">Farmer's Wallet</p>
                    <p className="font-mono text-sm">
                      {listing.walletAddress.substring(0, 6)}...{listing.walletAddress.substring(38)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contract terms */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Contract Terms</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="mr-2 text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Contract Duration</p>
                    <p>{listing.contractDuration}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Truck className="mr-2 text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Responsibility</p>
                    <p>{listing.deliveryResponsibility}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mr-2 text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Location</p>
                    <p>{listing.deliveryLocation}</p>
                  </div>
                </div>
                
                {listing.penaltyClauses && (
                  <div className="flex items-start">
                    <AlertCircle className="mr-2 text-green-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Penalty Clauses</p>
                      <p>{listing.penaltyClauses}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Users className="mr-2 text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Preferred Buyer Type</p>
                    <p>{listing.preferredBuyerType}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="mr-2 text-green-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Payment Mode</p>
                    <p>{listing.paymentMode}</p>
                  </div>
                </div>

                {listing.useSmartContract && (
                  <div className="flex items-start">
                    <Wallet className="mr-2 text-green-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Blockchain</p>
                      <p>{listing.preferredBlockchain}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Action panel */}
          <div className="p-6 bg-gray-50">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-green-700 mb-4">Price Details</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">₹{listing.expectedPrice}/{listing.quantityUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Price:</span>
                    <span className="font-semibold">₹{listing.minPrice}/{listing.quantityUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Required:</span>
                    <span className="font-semibold">
                      {listing.requiresAdvance ? `Yes (${listing.advanceAmount}%)` : 'No'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setContractFormVisible(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
                >
                  Create Contract
                </button>
              </div>
              
              {/* Farm details summary */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3">Listing Summary</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed On:</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                  {listing.useSmartContract && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blockchain:</span>
                      <span>{listing.preferredBlockchain}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contract Form Modal */}
      {contractFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create Farming Contract</h2>
            
            {transactionStatus === 'processing' ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={32} />
                <p>Processing blockchain transaction...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please confirm the transaction in your wallet
                </p>
              </div>
            ) : transactionStatus === 'success' ? (
              <div className="text-center py-8">
                <Check className="mx-auto mb-4 text-green-600" size={32} />
                <h3 className="text-lg font-medium mb-2">Contract Created Successfully!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Transaction Hash: {txHash.substring(0, 12)}...{txHash.substring(txHash.length - 10)}
                </p>
                <p>Redirecting to contract page...</p>
              </div>
            ) : (
              <form onSubmit={handleContractSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({listing.quantityUnit})*</label>
                    <input
                      type="number"
                      name="quantity"
                      value={contractForm.quantity}
                      onChange={handleContractFormChange}
                      required
                      min="1"
                      max={listing.quantity}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agreed Price (per {listing.quantityUnit})*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        name="agreedPrice"
                        value={contractForm.agreedPrice}
                        onChange={handleContractFormChange}
                        required
                        min={listing.minPrice}
                        step="0.01"
                        className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date*</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={contractForm.deliveryDate}
                      onChange={handleContractFormChange}
                      required
                      min={new Date(listing.expectedYieldDate).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  {listing.useSmartContract && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Wallet Address*</label>
                        <div className="flex">
                          <input
                            type="text"
                            name="buyerWalletAddress"
                            value={contractForm.buyerWalletAddress}
                            onChange={handleContractFormChange}
                            required
                            placeholder="0x..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={walletConnected}
                          />
                          <button
                            type="button"
                            onClick={connectWallet}
                            className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                          >
                            {walletConnected ? 'Connected' : 'Connect'}
                          </button>
                        </div>
                        {walletConnected && (
                          <p className="text-xs text-green-600 mt-1">
                            Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="useEscrow"
                          checked={contractForm.useEscrow}
                          onChange={handleContractFormChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Use Escrow Service</label>
                      </div>
                      
                      {contractForm.useEscrow && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Percentage*</label>
                          <select
                            name="escrowPercentage"
                            value={contractForm.escrowPercentage}
                            onChange={handleContractFormChange}
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
                    </>
                  )}
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={contractForm.acceptTerms}
                        onChange={handleContractFormChange}
                        required
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700">
                        I agree to the contract terms and conditions
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setContractFormVisible(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {listing.useSmartContract ? 'Create Smart Contract' : 'Create Contract'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Fullscreen Image Viewer */}
      {fullscreenImage && listing.images && listing.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <img 
              src={`http://localhost:3000/${listing.images[currentImageIndex]}`} 
              alt={`Fullscreen - ${listing.cropName}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {listing.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail navigation */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto py-2 max-w-full">
              {listing.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-green-500' : 'border-transparent'}`}
                >
                  <img 
                    src={`http://localhost:3000/${img}`} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          <div className="text-white mt-2">
            {currentImageIndex + 1} / {listing.images.length}
          </div>
        </div>
      )}
    </div>
  );
}