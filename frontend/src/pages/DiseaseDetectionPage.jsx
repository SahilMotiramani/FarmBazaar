import { useState } from 'react';
import { Upload, Camera, Loader2, RefreshCw, AlertTriangle, Check, Info, Printer } from 'lucide-react';

export default function DiseaseDetectionPage({ user }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plantType, setPlantType] = useState('');

  const plantTypes = [
    'Tomato', 'Potato', 'Corn', 'Pepper', 'Cucumber', 
    'Apple', 'Grape', 'Strawberry', 'Rice', 'Wheat',
    'Soybean', 'Citrus', 'Rose', 'Other'
  ];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (!plantType) {
      setError('Please select a plant type for more accurate results');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('plantType', plantType);

      const response = await fetch('http://localhost:5000/predictdisease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error detecting disease:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const sections = extractKeySections(result);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Plant Disease Report - ${plantType}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1 { color: #1a5c1a; border-bottom: 2px solid #1a5c1a; padding-bottom: 10px; }
            h2 { color: #1a5c1a; margin-top: 20px; }
            .header { margin-bottom: 20px; }
            .plant-info { margin-bottom: 30px; }
            .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
            .section-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .disease { background-color: #f0f7f0; }
            .symptoms { background-color: #fffaeb; }
            .severity { background-color: #f0f7fa; }
            .cause { background-color: #fff0f0; }
            .treatment { background-color: #f0f7f0; }
            .prevention { background-color: #f0f4fa; }
            .timeline { background-color: #f9f0ff; }
            .notes { background-color: #f5f5f5; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            @media print {
              @page { size: auto; margin: 10mm; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Plant Disease Diagnosis Report</h1>
            <div class="plant-info">
              <p><strong>Plant Type:</strong> ${plantType}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          ${sections.disease ? `
            <div class="section disease">
              <div class="section-title">DISEASE IDENTIFICATION</div>
              <div>${formatSectionContent(sections.disease)}</div>
            </div>
          `: ''}
          
          ${sections.symptoms ? `
            <div class="section symptoms">
              <div class="section-title">SYMPTOMS</div>
              <div>${formatSectionContent(sections.symptoms)}</div>
            </div>
          ` : ''}
          
          ${sections.severity ? `
            <div class="section severity">
              <div class="section-title">SEVERITY</div>
              <div>${formatSectionContent(sections.severity)}</div>
            </div>
          ` : ''}
          
          ${sections.cause ? `
            <div class="section cause">
              <div class="section-title">CAUSE</div>
              <div>${formatSectionContent(sections.cause)}</div>
            </div>
          ` : ''}
          
          ${sections.treatment ? `
            <div class="section treatment">
              <div class="section-title">TREATMENT RECOMMENDATIONS</div>
              <div>${formatSectionContent(sections.treatment, true)}</div>
            </div>
          ` : ''}
          
          ${sections.prevention ? `
            <div class="section prevention">
              <div class="section-title">PREVENTIVE MEASURES</div>
              <div>${formatSectionContent(sections.prevention, true)}</div>
            </div>
          ` : ''}
          
          ${sections.timeline ? `
            <div class="section timeline">
              <div class="section-title">RECOVERY TIMELINE</div>
              <div>${formatSectionContent(sections.timeline)}</div>
            </div>
          ` : ''}
          
          ${sections.notes ? `
            <div class="section notes">
              <div class="section-title">ADDITIONAL NOTES</div>
              <div>${formatSectionContent(sections.notes)}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This report was generated by Plant Health Analysis System. For serious conditions, please consult with a professional botanist or agricultural expert.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Format section content with proper formatting for lists
  const formatSectionContent = (content, makeList = false) => {
    if (!content) return '';
    
    // Replace newlines with breaks
    let formattedContent = content.replace(/\n/g, '<br />');
    
    // For treatment and prevention sections, try to format as numbered steps if requested
    if (makeList) {
      // Check if content appears to have numbered items or bullet points
      if (formattedContent.match(/(\d+\.|\-|\*)\s/g)) {
        // Replace existing breaks with actual breaks for parsing
        let tempContent = formattedContent.replace(/<br \/>/g, '\n');
        
        // Split by line breaks
        let lines = tempContent.split('\n');
        
        // Build list items
        let listItems = [];
        let inList = false;
        
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          
          // Check if this line starts a numbered or bullet item
          if (line.match(/^(\d+\.|\-|\*)\s/)) {
            if (!inList) {
              listItems.push('<ul>');
              inList = true;
            }
            // Remove the bullet/number and wrap in li
            let cleanLine = line.replace(/^(\d+\.|\-|\*)\s/, '');
            listItems.push(`<li>${cleanLine}</li>`);
          } else {
            if (inList) {
              listItems.push('</ul>');
              inList = false;
            }
            listItems.push(line + '<br />');
          }
        }
        
        if (inList) {
          listItems.push('</ul>');
        }
        
        formattedContent = listItems.join('');
      }
    }
    
    return formattedContent;
  };

  const extractKeySections = (result) => {
    if (!result) return {};
    
    // Clean up the result first
    const cleanedResult = result
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/<[^>]*>/g, '')
      .replace(/:/g,'')
      .replace(/^\d+\.\s*/gm, '')
       // Remove HTML tags
      .replace(/#+\s*/g, ''); // Remove markdown headers
    
    // Extract key sections
    const sections = {
      disease: extractSection(cleanedResult, 'DISEASE IDENTIFICATION'),
      symptoms: extractSection(cleanedResult, 'SYMPTOMS'),
      severity: extractSection(cleanedResult, 'SEVERITY'),
      cause: extractSection(cleanedResult, 'CAUSE'),
      treatment: extractSection(cleanedResult, 'TREATMENT RECOMMENDATIONS'),
      prevention: extractSection(cleanedResult, 'PREVENTIVE MEASURES'),
      timeline: extractSection(cleanedResult, 'RECOVERY TIMELINE'),
      notes: extractSection(cleanedResult, 'ADDITIONAL NOTES')
    };
    
    return sections;
  };

  const extractSection = (text, sectionName) => {
    const sectionIndex = text.indexOf(sectionName);
    if (sectionIndex === -1) return null;
    
    const nextSections = [
      'DISEASE IDENTIFICATION',
      'SYMPTOMS',
      'SEVERITY',
      'CAUSE',
      'TREATMENT RECOMMENDATIONS',
      'PREVENTIVE MEASURES',
      'RECOVERY TIMELINE',
      'ADDITIONAL NOTES'
    ];
    
    // Find the next section after current section
    let sectionEnd = text.length;
    
    for (const nextSection of nextSections) {
      if (nextSection === sectionName) continue;
      
      const nextSectionIndex = text.indexOf(nextSection, sectionIndex + sectionName.length);
      if (nextSectionIndex !== -1 && nextSectionIndex < sectionEnd) {
        sectionEnd = nextSectionIndex;
      }
    }
    
    let sectionContent = text.substring(sectionIndex + sectionName.length, sectionEnd).trim();
    
    return sectionContent;
  };

  const formatResult = (result) => {
    const sections = extractKeySections(result);
    if (!sections) return null;
    
    return (
      <div className="space-y-4">
        {sections.disease && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-2">Disease Identification</h3>
            <p dangerouslySetInnerHTML={{ __html: sections.disease.replace(/\n/g, '<br />') }} />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.symptoms && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Symptoms</h3>
              <p dangerouslySetInnerHTML={{ __html: sections.symptoms.replace(/\n/g, '<br />') }} />
            </div>
          )}
          
          {sections.cause && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Cause</h3>
              <p dangerouslySetInnerHTML={{ __html: sections.cause.replace(/\n/g, '<br />') }} />
            </div>
          )}
          
          {sections.severity && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Severity</h3>
              <p dangerouslySetInnerHTML={{ __html: sections.severity.replace(/\n/g, '<br />') }} />
            </div>
          )}
          
          {sections.timeline && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800 mb-2">Recovery Timeline</h3>
              <p dangerouslySetInnerHTML={{ __html: sections.timeline.replace(/\n/g, '<br />') }} />
            </div>
          )}
        </div>
        
        {sections.treatment && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-2">Treatment Recommendations</h3>
            <div dangerouslySetInnerHTML={{ __html: formatSectionContent(sections.treatment, true) }} />
          </div>
        )}
        
        {sections.prevention && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Preventive Measures</h3>
            <div dangerouslySetInnerHTML={{ __html: formatSectionContent(sections.prevention, true) }} />
          </div>
        )}
        
        {sections.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Additional Notes</h3>
            <p dangerouslySetInnerHTML={{ __html: sections.notes.replace(/\n/g, '<br />') }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-green-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Plant Disease Detection & Treatment Advisor</h1>
          <p className="text-green-100 mt-1">
            Upload a photo of your plant to identify diseases and get detailed treatment recommendations
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Plant preview" 
                        className="object-cover w-full h-64" 
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="plant-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="plant-type"
                        value={plantType}
                        onChange={(e) => setPlantType(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select plant type</option>
                        {plantTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Selecting the correct plant type improves analysis accuracy
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        New Image
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                          loading ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Camera size={16} className="mr-2" />
                            Analyze Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Tips for best results</h3>
                    <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
                      <li>Take clear, well-lit photos of the affected area</li>
                      <li>Include both healthy and diseased parts for comparison</li>
                      <li>Select the correct plant type for more accurate analysis</li>
                      <li>Multiple images may be needed for complex cases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-lg h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-gray-900">
                    Plant Health Analysis & Treatment Plan
                  </h2>
                  {result && (
                    <button
                      onClick={handlePrint}
                      className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Printer size={16} className="mr-2" />
                      Print
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 flex-grow">
                    <Loader2 size={48} className="animate-spin text-green-600 mb-4" />
                    <p className="text-gray-500">Analyzing your plant and preparing detailed recommendations...</p>
                  </div>
                ) : result ? (
                  <div className="flex-grow overflow-auto">
                    <div className="max-w-none pr-2">
                      {formatResult(result)}
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <Info size={16} className="mr-2 text-gray-400" />
                          Always consult with a professional botanist or agricultural expert for serious plant health issues.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 flex-grow">
                    <div className="mx-auto w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-4">
                      <Camera className="h-12 w-12 text-green-200" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No analysis yet</h3>
                    <p>Upload a photo of your plant and analyze it to receive a detailed health report and treatment plan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}