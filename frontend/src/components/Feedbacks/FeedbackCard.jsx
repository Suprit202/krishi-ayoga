// src/components/Feedbacks/FeedbackCard.jsx
import React, { useState } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

const ReportCard = ({ report, onAddMessage, onUpdateStatus, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Safe access to nested properties with fallbacks
  const farmerName = report.farmerId?.name || 'Farm Owner';
  const veterinarianName = report.veterinarianId?.name || 'Veterinarian';
  const livestockName = report.livestockGroupId?.name || 'Unknown Livestock';
  const livestockSpecies = report.livestockGroupId?.species || '';

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    const result = await onAddMessage(report._id, newMessage.trim());
    
    if (result.success) {
      setNewMessage('');
    }
    
    setIsSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(report._id, newStatus);
  };

  // Check if user can reply to this report
  const canReply = currentUser?._id && (
    // Veterinarian who created the report
    currentUser._id === report.veterinarianId?._id?.toString() ||
    // Admin can always reply
    currentUser.role === 'admin' ||
    // Farmer who owns the report (if farmerId exists)
    (report.farmerId && currentUser._id === report.farmerId._id?.toString()) ||
    // Farmer who owns the livestock group (even if report has no farmerId)
    (currentUser.role === 'farmer' && !report.farmerId)
  );

  // Check if user can update status
  const canUpdateStatus = currentUser?._id && (
    currentUser._id === report.veterinarianId?._id?.toString() ||
    currentUser.role === 'admin' ||
    (report.farmerId && currentUser._id === report.farmerId._id?.toString())
  );

  const unreadMessages = report.messages?.filter(
    message => !message.read && message.senderId !== currentUser?._id
  ).length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{report.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.priority === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : report.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {report.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'open' 
                  ? 'bg-blue-100 text-blue-800' 
                  : report.status === 'closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {report.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              Livestock: {livestockName} {livestockSpecies && `(${livestockSpecies})`}
            </p>
            
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              <span>
                {veterinarianName} → {farmerName}
                {!report.farmerId && ' (General Report)'}
              </span>
              <Clock className="h-4 w-4 ml-3 mr-1" />
              <span>{report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'Unknown date'}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {unreadMessages > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs px-2 py-1 mr-2">
                {unreadMessages}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Messages */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {!report.messages || report.messages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No messages yet</p>
            ) : (
              <div className="space-y-4">
                {report.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.senderId === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        message.senderId === currentUser?._id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser?._id
                          ? 'text-primary-100'
                          : 'text-gray-500'
                      }`}>
                        {message.createdAt ? format(new Date(message.createdAt), 'MMM d, h:mm a') : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Reply section */}
          {canReply && report.status !== 'closed' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Status actions */}
          {canUpdateStatus && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Update status:</span>
                <div className="flex gap-2">
                  {report.status !== 'closed' && (
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-md"
                    >
                      Close
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="px-3 py-1 bg-green-200 hover:bg-green-300 text-green-800 text-sm rounded-md"
                    >
                      Resolve
                    </button>
                  )}
                  {report.status !== 'open' && (
                    <button
                      onClick={() => handleStatusChange('open')}
                      className="px-3 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 text-sm rounded-md"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;