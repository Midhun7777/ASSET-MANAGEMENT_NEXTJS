'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface User {
  departmentId: string;
  departmentName: string;
  email: string;
  sectionName: string;
}

interface Asset {
  _id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  type: string;
  quantity: number;
  certificateUrl: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  department: string;
  departmentName: string;
  assignedTo: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition?: string;
  notes?: string;
  purchaseDate?: string;
  employeeName?: string;
  employeeId?: string;
  section?: string;
  employeeLevel?: string;
  idDocument?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    assetName: '',
    assetType: 'system',
    assignedTo: '',
    status: 'available',
    location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    lastMaintenance: '',
    nextMaintenance: '',
    condition: '',
    notes: '',
    employeeName: '',
    employeeId: '',
    section: '',
    employeeLevel: '',
    idDocument: '',
    quantity: 1,
    certificateUrl: '',
    department: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    // Set the assignedTo field to the user's departmentId
    setFormData(prev => ({
      ...prev,
      assignedTo: parsedUser.departmentId
    }));
    fetchAssets();
  }, [router]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/admin/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err) {
      setError('Error fetching assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validate required fields based on asset type
      const normalizedAssetType = formData.assetType.toLowerCase();
      
      if (normalizedAssetType === 'employee') {
        if (!formData.employeeName || !formData.employeeId || !formData.section || !formData.employeeLevel) {
          throw new Error('Please fill in all required employee fields');
        }
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assetType: normalizedAssetType,
          assetNumber: formData.assetId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          assetId: '',
          assetName: '',
          assetType: 'system',
          assignedTo: user?.departmentId || '',
          status: 'available',
          location: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          lastMaintenance: '',
          nextMaintenance: '',
          condition: '',
          notes: '',
          employeeName: '',
          employeeId: '',
          section: '',
          employeeLevel: '',
          idDocument: '',
          quantity: 1,
          certificateUrl: '',
          department: user?.departmentName || ''
        });
        setShowAddForm(false);
        fetchAssets();
      } else {
        setError(data.message || 'Failed to add asset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding asset');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, certificateUrl: data.url }));
      } else {
        setError('Failed to upload file');
      }
    } catch (err) {
      setError('Error uploading file');
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAssets();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete asset');
      }
    } catch (err) {
      setError('Error deleting asset');
    }
  };

  const handleModify = async (asset: Asset) => {
    try {
      setFormData({
        assetId: asset.assetId,
        assetName: asset.assetName,
        assetType: asset.assetType || asset.type,
        assignedTo: asset.assignedTo,
        status: asset.status,
        location: asset.location,
        purchaseDate: asset.purchaseDate || new Date().toISOString().split('T')[0],
        lastMaintenance: asset.lastMaintenance || '',
        nextMaintenance: asset.nextMaintenance || '',
        condition: asset.condition || '',
        notes: asset.notes || '',
        employeeName: asset.employeeName || '',
        employeeId: asset.employeeId || '',
        section: asset.section || '',
        employeeLevel: asset.employeeLevel || '',
        idDocument: asset.idDocument || '',
        quantity: asset.quantity || 1,
        certificateUrl: asset.certificateUrl || '',
        department: asset.departmentName || asset.department || ''
      });
      setShowAddForm(true);
    } catch (err) {
      setError('Error loading asset data for modification');
    }
  };

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
        {/* User Profile Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome, {user.departmentName}</h2>
                <div className="space-y-1 text-gray-300">
                  <p><span className="font-medium">Department ID:</span> {user.departmentId}</p>
                  <p><span className="font-medium">Section:</span> {user.sectionName}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            {user?.sectionName} Assets
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add New Asset'}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Add Asset Form */}
        {showAddForm && (
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

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter asset location"
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
                    placeholder="Select purchase date"
                  />
                </div>

                {formData.assetType === 'employee' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Employee Name</label>
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={formData.assetType === 'employee'}
                        title="Enter employee name"
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
                        title="Enter employee ID"
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
                        title="Enter section"
                        placeholder="Enter section"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Employee Level</label>
                      <input
                        type="text"
                        value={formData.employeeLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeLevel: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={formData.assetType === 'employee'}
                        title="Enter employee level"
                        placeholder="Enter employee level"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter any additional notes"
                    title="Enter additional notes about the asset"
                    aria-label="Additional notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                    title="Enter asset quantity"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Certificate</label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx"
                    title="Upload asset certificate"
                    aria-label="Upload asset certificate"
                  />
                  {formData.certificateUrl && (
                    <p className="text-sm text-green-400 mt-1">Certificate uploaded successfully</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    title="Enter department name"
                    placeholder="Enter department name"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Asset
              </button>
            </form>
          </motion.div>
        )}

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
                  <th className="pb-3">Asset ID</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Certificate</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.assetId} className="border-b border-gray-700">
                    <td className="py-3">{asset.assetType || asset.type}</td>
                    <td className="py-3">{asset.assetId}</td>
                    <td className="py-3">{asset.assetName}</td>
                    <td className="py-3">{asset.quantity || 1}</td>
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
                    <td className="py-3">{asset.location}</td>
                    <td className="py-3">{asset.departmentName || asset.department}</td>
                    <td className="py-3">
                      {asset.certificateUrl ? (
                        <a
                          href={asset.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Certificate
                        </a>
                      ) : (
                        <span className="text-gray-400">No certificate</span>
                      )}
                    </td>
                    <td className="py-3 space-x-2">
                      <button
                        onClick={() => handleModify(asset)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => handleDelete(asset.assetId)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
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