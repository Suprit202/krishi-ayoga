// backend/ai-services/index.js
const AnomalyDetector = require('./anomalyDetector');
const OutbreakPredictor = require('./outbreakPredictor');

// Create instances
const anomalyDetector = new AnomalyDetector();
const outbreakPredictor = new OutbreakPredictor();

module.exports = {
  anomalyDetector,
  outbreakPredictor
};