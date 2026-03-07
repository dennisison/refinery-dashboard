/**
 * corrosionModels.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines the process stream chemistry and conditions for each unit.
 * These become the "inflows" in OLI Engine API requests.
 *
 * OLI Engine API input structure reference:
 *   https://devdocs.olisystems.com/inflows-input
 *
 * Each entry maps to one OLI waterdrop calculation:
 *   - temperature / pressure → operating conditions
 *   - inflows → aqueous + hydrocarbon phase species
 *   - corrosionParameters → material and geometry
 *
 * Units follow OLI input unit conventions:
 *   temperature: °C, pressure: bar, flow: mol/s, concentration: mg/L or mol/L
 */

const UNIT_MODELS = {

  "CDU-1": {
    description: "Atmospheric crude distillation — overhead system",
    material:    "Carbon Steel A106",
    mechanism:   ["H2S corrosion", "Naphthenic acid", "HCl overhead"],
    conditions: {
      temperature: 370,   // °C flash zone
      pressure:    2.5,   // bara
    },
    // OLI inflows format — aqueous phase ionic species
    inflows: {
      H2O:  { value: 1000, unit: "mol/s" },
      H2S:  { value: 0.48, unit: "mol/s" },   // from SJV sour crude
      HCl:  { value: 0.12, unit: "mol/s" },   // chloride hydrolysis
      CO2:  { value: 0.08, unit: "mol/s" },
      // Naphthenic acid — expressed as TAN (mg KOH/g)
      NaphthenicAcid: { value: 2.1, unit: "mg/kg" },
    },
    // Wall thickness monitoring points (mm)
    monitorPoints: [
      { tag:"CDU1-OH-101", location:"Overhead vapor line",   nominalMM:12.7, currentMM:11.2 },
      { tag:"CDU1-TR-201", location:"Crude transfer line",   nominalMM:19.1, currentMM:18.4 },
      { tag:"CDU1-BT-301", location:"Bottom fractionator",   nominalMM:25.4, currentMM:24.8 },
      { tag:"CDU1-HX-401", location:"Crude preheat exchanger",nominalMM:9.5, currentMM:8.1  },
    ],
  },

  "CDU-2": {
    description: "Atmospheric crude distillation — unit 2",
    material:    "Carbon Steel A106",
    mechanism:   ["H2S corrosion", "Naphthenic acid", "HCl overhead"],
    conditions: {
      temperature: 371,
      pressure:    2.4,
    },
    inflows: {
      H2O:  { value: 900,  unit: "mol/s" },
      H2S:  { value: 0.42, unit: "mol/s" },
      HCl:  { value: 0.10, unit: "mol/s" },
      CO2:  { value: 0.07, unit: "mol/s" },
      NaphthenicAcid: { value: 1.9, unit: "mg/kg" },
    },
    monitorPoints: [
      { tag:"CDU2-OH-101", location:"Overhead vapor line",   nominalMM:12.7, currentMM:11.8 },
      { tag:"CDU2-TR-201", location:"Crude transfer line",   nominalMM:19.1, currentMM:18.9 },
      { tag:"CDU2-HX-401", location:"Crude preheat exchanger",nominalMM:9.5, currentMM:8.8  },
    ],
  },

  "FCC-1": {
    description: "Fluid catalytic cracker — reactor/regenerator system",
    material:    "1.25Cr-0.5Mo (P11)",
    mechanism:   ["High-temp H2S/H2", "Catalyst erosion-corrosion", "Polythionic acid SCC"],
    conditions: {
      temperature: 532,   // °C regenerator
      pressure:    2.8,   // bara
    },
    inflows: {
      H2O:  { value: 200,  unit: "mol/s" },
      H2S:  { value: 1.82, unit: "mol/s" },  // high — cat cracker H2S production
      H2:   { value: 0.95, unit: "mol/s" },
      SO2:  { value: 0.22, unit: "mol/s" },  // regenerator flue gas
      NH3:  { value: 0.14, unit: "mol/s" },
    },
    monitorPoints: [
      { tag:"FCC1-RX-101",  location:"Reactor riser outlet",    nominalMM:22.2, currentMM:19.8 },
      { tag:"FCC1-RG-201",  location:"Regenerator vessel wall", nominalMM:28.6, currentMM:27.1 },
      { tag:"FCC1-SL-301",  location:"Slurry circuit piping",   nominalMM:12.7, currentMM:10.2 },
      { tag:"FCC1-FG-401",  location:"Flue gas transfer line",  nominalMM:15.9, currentMM:15.1 },
    ],
  },

  "HCR-1": {
    description: "Hydrocracker — high-pressure H2 service",
    material:    "2.25Cr-1Mo-V (P91)",
    mechanism:   ["Wet H2S / SOHIC", "High-temp H2 attack (HTHA)", "Ammonium bisulfide"],
    conditions: {
      temperature: 398,
      pressure:    178,   // bara — high pressure H2
    },
    inflows: {
      H2O:  { value: 400,  unit: "mol/s" },
      H2S:  { value: 0.88, unit: "mol/s" },
      H2:   { value: 8.40, unit: "mol/s" },  // high H2 partial pressure
      NH3:  { value: 0.32, unit: "mol/s" },
      // Ammonium bisulfide — forms at reactor effluent air coolers
      NH4HS: { value: 0.18, unit: "mol/s" },
    },
    monitorPoints: [
      { tag:"HCR1-RX-101",  location:"Reactor inlet piping",    nominalMM:50.8, currentMM:50.1 },
      { tag:"HCR1-EF-201",  location:"Effluent air cooler",     nominalMM:6.4,  currentMM:5.1  },
      { tag:"HCR1-HS-301",  location:"H2S stripper overhead",   nominalMM:9.5,  currentMM:8.8  },
      { tag:"HCR1-HP-401",  location:"HP separator vessel",     nominalMM:44.5, currentMM:43.9 },
    ],
  },

  "DCK-1": {
    description: "Delayed coker — fuel-grade coke service",
    material:    "Carbon Steel / 410SS cladding",
    mechanism:   ["Thermal fatigue (drum cycling)", "H2S/H2 at temperature", "Wet H2S overhead"],
    conditions: {
      temperature: 491,
      pressure:    4.1,
    },
    inflows: {
      H2O:  { value: 600,  unit: "mol/s" },
      H2S:  { value: 1.24, unit: "mol/s" },
      H2:   { value: 0.62, unit: "mol/s" },
      CO2:  { value: 0.18, unit: "mol/s" },
      // Coke drum cycle stress — captured as thermal parameter
    },
    monitorPoints: [
      { tag:"DCK1-DM-101A", location:"Coke drum A shell (mid)", nominalMM:31.8, currentMM:28.4 },
      { tag:"DCK1-DM-101B", location:"Coke drum B shell (mid)", nominalMM:31.8, currentMM:27.9 },
      { tag:"DCK1-HT-201",  location:"Heater outlet transfer",  nominalMM:22.2, currentMM:21.0 },
      { tag:"DCK1-OH-301",  location:"Fractionator overhead",   nominalMM:12.7, currentMM:11.4 },
    ],
  },

  "DCK-2": {
    description: "Delayed coker — anode-grade coke service",
    material:    "Carbon Steel / 410SS cladding",
    mechanism:   ["Thermal fatigue (drum cycling)", "H2S/H2 at temperature"],
    conditions: {
      temperature: 487,
      pressure:    4.0,
    },
    inflows: {
      H2O:  { value: 550,  unit: "mol/s" },
      H2S:  { value: 1.10, unit: "mol/s" },
      H2:   { value: 0.55, unit: "mol/s" },
      CO2:  { value: 0.14, unit: "mol/s" },
    },
    monitorPoints: [
      { tag:"DCK2-DM-101A", location:"Coke drum A shell (mid)", nominalMM:31.8, currentMM:29.2 },
      { tag:"DCK2-DM-101B", location:"Coke drum B shell (mid)", nominalMM:31.8, currentMM:28.8 },
      { tag:"DCK2-HT-201",  location:"Heater outlet transfer",  nominalMM:22.2, currentMM:21.6 },
    ],
  },

  "ALK-1": {
    description: "Sulfuric acid alkylation unit",
    material:    "Carbon Steel (acid-resistant lining)",
    mechanism:   ["H2SO4 corrosion", "Dilute acid attack", "HF carry-over risk"],
    conditions: {
      temperature: 15,    // °C — cold service, refrigeration
      pressure:    8.8,   // bara
    },
    inflows: {
      H2O:    { value: 50,   unit: "mol/s" },
      H2SO4:  { value: 2.80, unit: "mol/s" },  // 98% H2SO4 fresh / 88% spent
      H2S:    { value: 0.04, unit: "mol/s" },
      // Acid strength — key corrosion driver
      AcidStrength: { value: 91.5, unit: "wt%" },
    },
    monitorPoints: [
      { tag:"ALK1-RX-101",  location:"Reactor effluent piping",  nominalMM:9.5,  currentMM:8.4  },
      { tag:"ALK1-AC-201",  location:"Acid settler vessel",      nominalMM:12.7, currentMM:11.9 },
      { tag:"ALK1-RF-301",  location:"Refrigeration circuit",    nominalMM:6.4,  currentMM:5.9  },
      { tag:"ALK1-DI-401",  location:"Deisobutanizer overhead",  nominalMM:9.5,  currentMM:9.0  },
    ],
  },
};

// Minimum remaining wall thickness thresholds (% of nominal)
const RETIREMENT_THRESHOLD_PCT = 0.75;  // retire at 75% of nominal
const ALERT_THRESHOLD_PCT      = 0.85;  // alert at 85% of nominal

// Derive status for a monitor point
function getPointStatus(point) {
  const pct = point.currentMM / point.nominalMM;
  if (pct <= RETIREMENT_THRESHOLD_PCT) return "critical";
  if (pct <= ALERT_THRESHOLD_PCT)      return "warning";
  return "ok";
}

// Remaining life estimate — simple linear extrapolation
function remainingLifeYears(point, corrosionRateMmPerYear) {
  if (!corrosionRateMmPerYear || corrosionRateMmPerYear <= 0) return null;
  const retirementThickness = point.nominalMM * RETIREMENT_THRESHOLD_PCT;
  const remainingAllowable  = point.currentMM - retirementThickness;
  if (remainingAllowable <= 0) return 0;
  return parseFloat((remainingAllowable / corrosionRateMmPerYear).toFixed(1));
}

module.exports = {
  UNIT_MODELS,
  RETIREMENT_THRESHOLD_PCT,
  ALERT_THRESHOLD_PCT,
  getPointStatus,
  remainingLifeYears,
};
