'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Asset {
  assetId: string;
  assetName: string;
  assetType: string;
  assignedTo?: string;
  status: string;
  location?: string;
  purchaseDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition?: string;
  notes?: string;
  employeeName?: string;
  employeeId?: string;
  section?: string;
  employeeLevel?: string;
  idDocument?: string;
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminAssets() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Asset, 'createdAt' | 'updatedAt'>>({
    assetId: '',
    assetName: '',
    assetType: 'system',
    assignedTo: '',
    status: 'available',
    location: '',
    purchaseDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    condition: '',
    notes: '',
    employeeName: '',
    employeeId: '',
    section: '',
    employeeLevel: '',
    idDocument: '',
    certificate: ''
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/assets');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched assets:', data);
        setAssets(data);
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err) {
      setError('Error fetching assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Uploading file:', file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok && data.url) {
        console.log('Setting idDocument:', data.url);
        setFormData(prev => ({ ...prev, idDocument: data.url }));
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const normalizedAssetType = formData.assetType.toLowerCase();
      console.log('Submitting asset data:', formData);
      
      if (normalizedAssetType === 'employee') {
        if (!formData.employeeName || !formData.employeeId || !formData.section || !formData.employeeLevel) {
          throw new Error('Please fill in all required employee fields');
        }
      }

      if (!formData.idDocument) {
        throw new Error('Please upload a certificate or ID document');
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assetType: normalizedAssetType,
          idDocument: formData.idDocument // Ensure idDocument is included
        }),
      });

      const data = await response.json();
      console.log('Asset creation response:', data);

      if (response.ok) {
        // Reset form
        setFormData({
          assetId: '',
          assetName: '',
          assetType: 'system',
          assignedTo: '',
          status: 'available',
          location: '',
          purchaseDate: '',
          lastMaintenance: '',
          nextMaintenance: '',
          condition: '',
          notes: '',
          employeeName: '',
          employeeId: '',
          section: '',
          employeeLevel: '',
          idDocument: ''
        });

        // Fetch the updated list
        await fetchAssets();
      } else {
        setError(data.message || 'Failed to add asset. Please check all required fields and try again.');
      }
    } catch (err) {
      console.error('Error adding asset:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while adding the asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Assets state updated:', assets);
  }, [assets]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Asset Management
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Add Asset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset Type</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetType: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  title="Select asset type"
                  aria-label="Select asset type"
                >
                  <option value="system">System</option>
                  <option value="table">Table</option>
                  <option value="chair">Chair</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asset ID</label>
                <input
                  type="text"
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="e.g., ASSET-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asset Name</label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetName: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter asset name"
                />
              </div>

              {formData.assetType === 'employee' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Name</label>
                    <input
                      type="text"
                      value={formData.employeeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.assetType === 'employee'}
                      placeholder="Enter employee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.assetType === 'employee'}
                      placeholder="Enter employee ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.assetType === 'employee'}
                      placeholder="Enter section"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Level</label>
                    <select
                      value={formData.employeeLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeLevel: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.assetType === 'employee'}
                      title="Select employee level"
                      aria-label="Select employee level"
                    >
                      <option value="">Select level</option>
                      <option value="SC">SC</option>
                      <option value="OS">OS</option>
                      <option value="Head">Head</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select purchase date"
                      aria-label="Select purchase date"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  title="Select asset status"
                  aria-label="Select asset status"
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {formData.assetType === 'employee' ? 'ID Document' : 'Certificate'}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                    title={formData.assetType === 'employee' ? 'Upload ID document' : 'Upload asset certificate'}
                    aria-label={formData.assetType === 'employee' ? 'Upload ID document' : 'Upload asset certificate'}
                  />
                  {formData.idDocument && (
                    <span className="text-green-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Uploaded
                    </span>
                  )}
                </div>
                {!formData.idDocument && (
                  <p className="text-red-400 text-sm mt-1">Please upload a {formData.assetType === 'employee' ? 'ID document' : 'certificate'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Asset...
                </>
              ) : (
                'Add Asset'
              )}
            </button>
          </form>
        </motion.div>

        {/* Assets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 overflow-x-auto"
        >
          <h2 className="text-xl font-semibold mb-4">Asset Inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Name</th>
                  {formData.assetType === 'employee' ? (
                    <>
                      <th className="pb-3">Employee ID</th>
                      <th className="pb-3">Section</th>
                      <th className="pb-3">Level</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Purchase Date</th>
                    </>
                  )}
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Document</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.assetId} className="border-b border-gray-700">
                    <td className="py-3">{asset.assetType}</td>
                    <td className="py-3">{asset.assetId}</td>
                    <td className="py-3">{asset.assetName}</td>
                    {asset.assetType === 'employee' ? (
                      <>
                        <td className="py-3">{asset.employeeId}</td>
                        <td className="py-3">{asset.section}</td>
                        <td className="py-3">{asset.employeeLevel}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3">{asset.location}</td>
                        <td className="py-3">{asset.purchaseDate}</td>
                      </>
                    )}
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        asset.status === 'available' ? 'bg-green-900/50 text-green-300' :
                        asset.status === 'in-use' ? 'bg-blue-900/50 text-blue-300' :
                        asset.status === 'maintenance' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {asset.idDocument ? (
                        <button
                          onClick={() => window.open(asset.idDocument, '_blank')}
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          View Document
                        </button>
                      ) : (
                        <span className="text-gray-500">No document</span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => router.push(`/admin/assets/${asset.assetId}`)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}