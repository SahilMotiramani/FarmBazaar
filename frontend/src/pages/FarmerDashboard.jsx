import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Package, DollarSign, FileText, Edit, Trash2, Plus } from 'lucide-react';

export default function FarmerDashboardPage({ user }) {
  const [listings, setListings] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch farmer's listings
        const listingsResponse = await fetch('http://localhost:3000/api/v1/contracts/my-listings', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!listingsResponse.ok) {
          const errorData = await listingsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch listings');
        }
        
        const listingsData = await listingsResponse.json();
        setListings(listingsData.listings || []);
        
        // Fetch active contracts
        const contractsResponse = await fetch('http://localhost:3000/api/v1/contracts/active', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!contractsResponse.ok) {
          const errorData = await contractsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch contracts');
        }
        
        const contractsData = await contractsResponse.json();
        setContracts(contractsData.contracts || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/contracts/${listingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setListings(prev => prev.filter(listing => listing._id !== listingId));
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">Farmer Dashboard</h1>
        <Link 
          to="/add-listing"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add New Listing
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'listings' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Listings
          </button>
          
          <button
            onClick={() => setActiveTab('contracts')}
            className={`ml-8 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'contracts' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Contracts
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'listings' ? (
        <>
          {listings.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
              <Link 
                to="/add-listing"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium inline-flex items-center"
              >
                <Plus className="mr-2" size={18} />
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <div key={listing._id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-green-700">{listing.cropName}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {listing.status || 'Active'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{listing.cropVariety} • {listing.cropCategory}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="mr-2" size={16} />
                        {listing.quantity} {listing.quantityUnit} available
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2" size={16} />
                        Harvest: {new Date(listing.expectedYieldDate).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2" size={16} />
                        {listing.village}, {listing.district}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="mr-2" size={16} />
                        ₹{listing.expectedPrice} per {listing.quantityUnit}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2" size={16} />
                        Contract duration: {listing.contractDuration}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <Link 
                      to={`/listing/${listing._id}`}
                      className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium"
                    >
                      <FileText className="mr-1" size={16} />
                      View Details
                    </Link>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/editlisting/${listing._id}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                      >
                        <Edit className="mr-1" size={16} />
                        Edit
                      </Link>

                      {/* <Link 
          to="/add-listing"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add New Listing
        </Link> */}
      
                      
                      
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                      >
                        <Trash2 className="mr-1" size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {contracts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600">You don't have any active contracts yet.</p>
              <p className="text-gray-600 mt-2">Contracts will appear here when buyers agree to your listings.</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg divide-y">
              {contracts.map(contract => (
                <div key={contract._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-green-700">{contract.cropName} Contract</h3>
                      <p className="text-gray-600">with {contract.buyerName}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {contract.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{contract.quantity} {contract.quantityUnit}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">₹{contract.agreedPrice} per {contract.quantityUnit}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Delivery Date</p>
                      <p className="font-medium">{new Date(contract.deliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to={`/contract-details/${contract._id}`}
                      className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium"
                    >
                      <FileText className="mr-1" size={16} />
                      View Contract Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}