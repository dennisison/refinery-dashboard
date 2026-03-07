/**
 * useNavigation.js
 * Owns all routing state for the app:
 *   - which top-level page is active (overview, units, crude, quality, markets)
 *   - which unit is being drilled into (null = list view)
 *   - which KPI modal is open (null = closed)
 *   - which chart point detail is open
 *   - which alert was clicked (for jump-to behavior)
 *
 * No external router needed — pure React state.
 * Extend with useSearchParams or React Router later if needed.
 */

import { useState, useCallback } from "react";

export const PAGES = {
  OVERVIEW: "overview",
  UNITS: "units",
  CRUDE: "crude",
  QUALITY: "quality",
  MARKETS: "markets",
  CORROSION: "corrosion",
};

export default function useNavigation() {
  const [page, setPage] = useState(PAGES.OVERVIEW);
  const [activeUnit, setActiveUnit] = useState(null); // unit name string e.g. "FCC-1"
  const [kpiModal, setKpiModal] = useState(null); // kpi key string e.g. "crudeThroughput"
  const [pointDetail, setPointDetail] = useState(null); // { dataKey, payload, page }
  const [alertTarget, setAlertTarget] = useState(null); // unit name to highlight

  // Navigate to a top-level page
  const goTo = useCallback((p) => {
    setPage(p);
    setActiveUnit(null);
    setAlertTarget(null);
  }, []);

  // Drill into a specific unit from any page
  const openUnit = useCallback((unitName) => {
    setPage(PAGES.UNITS);
    setActiveUnit(unitName);
  }, []);

  // Go back to the unit list from unit detail
  const closeUnit = useCallback(() => setActiveUnit(null), []);

  // Open KPI trend modal
  const openKpiModal = useCallback((key) => setKpiModal(key), []);
  const closeKpiModal = useCallback(() => setKpiModal(null), []);

  // Open chart point detail
  const openPointDetail = useCallback((info) => setPointDetail(info), []);
  const closePointDetail = useCallback(() => setPointDetail(null), []);

  // Jump to unit from alert click
  const jumpFromAlert = useCallback((unitName) => {
    // If the unit is a process unit, go to units page and highlight it
    const processUnits = [
      "CDU-1",
      "CDU-2",
      "VDU-1",
      "FCC-1",
      "HCR-1",
      "DCK-1",
      "DCK-2",
      "RFM-1",
      "ALK-1",
      "HDS-1",
      "COGEN",
    ];
    if (processUnits.includes(unitName)) {
      setPage(PAGES.UNITS);
      setActiveUnit(unitName);
    } else if (unitName === "CARB") {
      setPage(PAGES.QUALITY);
    } else if (unitName === "MARINE") {
      setPage(PAGES.CRUDE);
    }
    setAlertTarget(unitName);
  }, []);

  return {
    page,
    activeUnit,
    kpiModal,
    pointDetail,
    alertTarget,
    goTo,
    openUnit,
    closeUnit,
    openKpiModal,
    closeKpiModal,
    openPointDetail,
    closePointDetail,
    jumpFromAlert,
  };
}
