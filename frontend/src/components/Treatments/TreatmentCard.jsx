import React from 'react';

const TreatmentCard = ({ treatment }) => {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-400 text-red-700';
      case 'medium': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default: return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{treatment.drugName}</h3>
          <p className="text-sm text-gray-600">{treatment.groupName} • {treatment.species}</p>
          <p className="text-sm text-gray-600">Dosage: {treatment.dosage}</p>
          <p className="text-sm text-gray-500">
            {new Date(treatment.dateAdministered).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {treatment.administeredBy?.name}
          </span>
        </div>
      </div>

      {/* AI Analysis Alerts */}
      {treatment.aiAnalysis.anomalies.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-red-600 mb-2">🚨 Critical Issues</h4>
          {treatment.aiAnalysis.anomalies.map((anomaly, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSeverityClass(anomaly.severity)} mb-2`}
            >
              <p className="text-sm font-medium">{anomaly.message}</p>
            </div>
          ))}
        </div>
      )}

      {treatment.aiAnalysis.warnings.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-yellow-600 mb-2">⚠️ Warnings</h4>
          {treatment.aiAnalysis.warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSeverityClass(warning.severity)} mb-2`}
            >
              <p className="text-sm font-medium">{warning.message}</p>
            </div>
          ))}
        </div>
      )}

      {treatment.aiAnalysis.anomalies.length === 0 && treatment.aiAnalysis.warnings.length === 0 && (
        <div className="p-3 rounded-lg bg-green-100 border border-green-400 text-green-700">
          <p className="text-sm font-medium">✅ No issues detected</p>
        </div>
      )}

      {/* Blockchain Hash */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 break-all">
          Data Hash: {treatment.dataHash}
        </p>
      </div>
    </div>
  );
};

export default TreatmentCard;