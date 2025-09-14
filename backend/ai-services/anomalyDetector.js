const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');

class AnomalyDetector {
  constructor() {
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return {
      dosageRules: {
        'Oxytetracycline': { Cattle: 20, Poultry: 15, Swine: 15, Sheep: 18, Goat: 16, Fish: 10 },
        'Penicillin G': { Cattle: 25, Poultry: 20, Swine: 22, Sheep: 24, Goat: 21 },
        'Ivermectin': { Cattle: 0.2, Swine: 0.3, Sheep: 0.25, Goat: 0.22 },
        'Flunixin Meglumine': { Cattle: 2.2, Swine: 2.0, Sheep: 1.8},
        'Enrofloxacin': { Cattle: 5.0, Poultry: 3.5, Swine: 4.5 }
      },
      
      withdrawalRules: {
        'Oxytetracycline': 18,
        'Penicillin G': 10,
        'Ivermectin': 28,
        'Flunixin Meglumine': 5,
        'Enrofloxacin': 14
      },
      
      speciesCompatibility: {
        'Oxytetracycline': ['Cattle', 'Poultry', 'Swine', 'Sheep', 'Goat', 'Fish'],
        'Penicillin G': ['Cattle', 'Poultry', 'Swine', 'Sheep', 'Goat'],
        'Ivermectin': ['Cattle', 'Swine', 'Sheep', 'Goat'],
        'Enrofloxacin': ['Poultry', 'Swine', 'Cattle'],
        'Flunixin Meglumine': ['Cattle', 'Swine', 'Sheep']
      }
    };
  }

  parseDosage(dosageString) {
  try {
    // Extract numbers from string like "30 mg/kg" → "30"
    const numericPart = dosageString.match(/(\d+\.?\d*)/);
    return numericPart ? parseFloat(numericPart[0]) : 0;
  } catch (error) {
    console.error('Dosage parsing error:', error);
    return 0;
  }
}

  async detectAnomalies(treatmentData, drug, livestockGroup) {
    const anomalies = [];
    const warnings = [];

    // Parse dosage
    const dosageValue = this.parseDosage(treatmentData.dosage);

    // Rule 1: Dosage anomaly detection
    const dosageRule = this.rules.dosageRules[drug.name]?.[livestockGroup.species];
    if (dosageRule && dosageValue > dosageRule * 1.5) {
      anomalies.push({
        type: 'high_dosage',
        severity: 'high',
        message: `Dosage (${dosageValue}mg/kg) exceeds recommended limit for ${livestockGroup.species}. Maximum: ${dosageRule}mg/kg`
      });
    }

    // Rule 2: Species compatibility
    const allowedSpecies = this.rules.speciesCompatibility[drug.name];
    if (allowedSpecies && !allowedSpecies.includes(livestockGroup.species)) {
      warnings.push({
        type: 'off_label_species',
        severity: 'medium',
        message: `${drug.name} is not typically approved for ${livestockGroup.species}. Consult veterinarian.`
      });
    }

    // Rule 3: Frequency anomaly (check recent uses)
    const recentUses = await this.getRecentDrugUsage(treatmentData.drugId, treatmentData.livestockGroupId);
    if (recentUses > 2) { // More than 2 uses in last 30 days
      warnings.push({
        type: 'frequent_use',
        severity: 'medium',
        message: `Frequent use detected: ${recentUses} treatments with ${drug.name} in past 30 days`
      });
    }

    return { 
      anomalies, 
      warnings, 
      confidence: (anomalies.length > 0 || warnings.length > 0) ? 0.92 : 0.85 
    };
  }

  async getRecentDrugUsage(drugId, livestockGroupId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await Treatment.countDocuments({
      drugId: drugId,
      livestockGroupId: livestockGroupId,
      dateAdministered: { $gte: thirtyDaysAgo }
    });

    return count;
  }

  checkWithdrawalCompliance(treatment, plannedSaleDate) {
    const requiredPeriod = this.rules.withdrawalRules[treatment.drugName];
    if (!requiredPeriod) return { compliant: true };

    const withdrawalEnd = new Date(treatment.dateAdministered);
    withdrawalEnd.setDate(withdrawalEnd.getDate() + requiredPeriod);
    
    const saleDate = new Date(plannedSaleDate);
    const isCompliant = saleDate > withdrawalEnd;
    
    if (!isCompliant) {
      return {
        compliant: false,
        violation: {
          type: 'withdrawal_period_violation',
          severity: 'critical',
          message: `Sale planned before withdrawal period ends. Safe after: ${withdrawalEnd.toDateString()}`,
          requiredPeriod: requiredPeriod,
          withdrawalEndDate: withdrawalEnd
        }
      };
    }

    return { compliant: true };
  }
}

module.exports = AnomalyDetector;