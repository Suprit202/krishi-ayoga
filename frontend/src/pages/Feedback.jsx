// src/pages/Reports.jsx (updated)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReports } from '../hooks/useReports';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Search
} from 'lucide-react';
import ReportModal from '../components/Feedbacks/FeedbackModal';
import ReportCard from '../components/Feedbacks/FeedbackCard';

const Feedback = () => {
  const { user, isVeterinarian, isFarmer } = useAuth();
  const { reports, loading, error, createReport, addMessage, updateStatus } = useReports();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateReport = async (reportData) => {
    const result = await createReport(reportData);
    
    if (result.success) {
      showNotification('Report created successfully', 'success');
      setIsModalOpen(false);
    } else {
      showNotification(result.error, 'error');
    }
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.livestockGroupId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReports = filteredReports.filter(report => report.status === 'open');
  const closedReports = filteredReports.filter(report => report.status !== 'open');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Communications</h1>
          <p className="text-gray-600 mt-2">
            Manage veterinary reports and communications about livestock treatments
          </p>
        </div>
        
        {isVeterinarian && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-0 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Report
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            Open Reports ({openReports.length})
          </h2>
          
          {openReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No open reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openReports.map(report => (
                <ReportCard 
                  key={report._id} 
                  report={report} 
                  onAddMessage={addMessage}
                  onUpdateStatus={updateStatus}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            Closed Reports ({closedReports.length})
          </h2>
          
          {closedReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No closed reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {closedReports.map(report => (
                <ReportCard 
                  key={report._id} 
                  report={report} 
                  onAddMessage={addMessage}
                  onUpdateStatus={updateStatus}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateReport}
        />
      )}
    </div>
  );
};

export default Feedback;