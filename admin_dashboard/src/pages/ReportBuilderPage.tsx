import React, { useState } from 'react';
import { OrchardReport, OrchardRequest } from '../types/index.js';
import { PdfGenerator } from '../services/pdfGenerator.js';
import { OrchardApi } from '../api/orchard.api.js';

interface Props {
  request: OrchardRequest;
  onBack: () => void;
}

export const ReportBuilderPage: React.FC<Props> = ({ request, onBack }) => {
  const existingReport = request.report;

  // 1. Executive Summary & Recommended Varieties
  const [summary, setSummary] = useState(
    existingReport?.summary ||
      `Comprehensive ultra-high-density fruit orchard architecture designed specifically for ${request.landDetails.size} of ${request.landDetails.soilType} in ${request.gps.village || 'Pune'}, maximizing early cash flow within 24 months.`
  );

  const [varieties, setVarieties] = useState(
    existingReport?.recommendedVarieties || [
      { crop: 'Mango', variety: 'Kesar & Alphonso Grafted', yieldPerAcre: '4.5 - 6.0 Tons', plantingSeason: 'July - August (Monsoon)' },
      { crop: 'Guava', variety: 'Taiwan Pink (VNR Bihi)', yieldPerAcre: '8.0 - 10.0 Tons', plantingSeason: 'July - September' },
    ]
  );

  // 2. Spacing & Density
  const [rowSpacing, setRowSpacing] = useState(existingReport?.plantationLayout?.rowSpacingMeters || 4.5);
  const [plantSpacing, setPlantSpacing] = useState(existingReport?.plantationLayout?.plantSpacingMeters || 3.0);
  const [totalPlants, setTotalPlants] = useState(existingReport?.plantationLayout?.totalPlantsEstimate || 740);

  // 3. Soil Preparation
  const [soilTreatment, setSoilTreatment] = useState(
    existingReport?.soilTreatment ||
      'Excavate 1m x 1m x 1m pits. Solarize for 15 days. Refill with 50% topsoil mixed with 15kg FYM, 500g Neem cake, 250g Trichoderma viride, and 100g Single Super Phosphate (SSP) per pit.'
  );

  // 4. Fertilizers & Fertigation
  const [fertilizerSchedule, setFertilizerSchedule] = useState(
    existingReport?.fertilizerSchedule ||
      'Basal: SSP 250g + MOP 100g. Vegetative: Water-soluble 19:19:19 @ 5g/plant/week via drip. Pre-flowering: 12:61:0 @ 8g/plant. Fruit development: 0:0:50 @ 10g/plant.'
  );

  // 5. Drip Layout
  const [dripLayout, setDripLayout] = useState(
    existingReport?.dripLayout ||
      '16mm inline drip laterals with 4 LPH pressure-compensating drippers placed 45cm on either side of the plant trunk. Peak summer water quota: 35 Liters / plant / day.'
  );

  // 6. Estimated Cost
  const [estimatedBudget, setEstimatedBudget] = useState(existingReport?.estimatedBudget || 85000);

  // 7. ROI
  const [projectedRoi, setProjectedRoi] = useState(
    existingReport?.projectedRoi ||
      'Year 1: Intercrop revenue Rs. 40,000. Year 2: Guava yield Rs. 1.2 Lakhs. Year 3+: Full commercial canopy generating Rs. 2.8 - 3.5 Lakhs net annual income. Break-even: Month 26.'
  );

  // 8. Timeline
  const [implementationTimeline, setImplementationTimeline] = useState(
    existingReport?.implementationTimeline ||
      'Month 1: Soil testing & pit excavation. Month 2: Drip irrigation installation & planting certified grafts. Month 3-6: Training single stem canopy & micronutrient foliar spray.'
  );

  // 9. Diseases to Watch
  const [pestControl, setPestControl] = useState(
    existingReport?.pestControl ||
      'Pre-monsoon 1% Bordeaux mixture spray for fungal leaf spot. Install 6 methyl eugenol pheromone traps/acre for fruit fly control. Neem oil 1500ppm for thrips and aphids.'
  );

  // 10. Government Schemes
  const [governmentSchemes, setGovernmentSchemes] = useState(
    existingReport?.governmentSchemes ||
      '1. MIDH (Mission for Integrated Development of Horticulture): 40% capital subsidy on planting material. 2. PMKSY Micro-Irrigation: Up to 55% subsidy on drip system.'
  );

  // 11. Maintenance Calendar
  const [maintenanceCalendar, setMaintenanceCalendar] = useState(
    existingReport?.maintenanceCalendar ||
      'January-February: Canopy thinning & sanitization pruning. June: Basin opening, weeding & organic manure incorporation. October: Post-monsoon copper spray & mulching.'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const buildReportObject = (): OrchardReport => {
    return {
      id: existingReport?.id || `REP-${request.id.slice(-6)}`,
      orchardRequestId: request.id,
      summary,
      recommendedVarieties: varieties,
      plantationLayout: {
        rowSpacingMeters: Number(rowSpacing),
        plantSpacingMeters: Number(plantSpacing),
        totalPlantsEstimate: Number(totalPlants),
      },
      soilTreatment,
      fertilizerSchedule,
      waterRequirement: '35 Liters / plant / day in peak summer',
      dripLayout,
      estimatedBudget: Number(estimatedBudget),
      projectedRoi,
      implementationTimeline,
      pestControl,
      governmentSchemes,
      maintenanceCalendar,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleDownloadPdf = () => {
    const report = buildReportObject();
    const doc = PdfGenerator.generateOrchardReportPdf(request, report);
    doc.save(`Kisan-Mithar-Orchard-Plan-${request.id}.pdf`);
  };

  const handleSaveAndDeliver = async () => {
    setIsSaving(true);
    const report = buildReportObject();
    await OrchardApi.submitReport(request.id, report);
    await OrchardApi.updateStatus(request.id, 'PLAN_READY');
    setIsSaving(false);
    setStatusBanner('✓ Report successfully saved & delivered to Farmer App! Mobile push notification triggered.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem 0.875rem' }}>
            ← Back to Request
          </button>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Orchard Architecture & Feasibility Report Builder</h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Preparing formal plan for {request.farmer?.name} ({request.landDetails.size} · {request.gps.village})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadPdf} className="btn-secondary">
            <span>📥</span> Download PDF
          </button>
          <button onClick={handleSaveAndDeliver} disabled={isSaving} className="btn-primary">
            <span>🚀</span> {isSaving ? 'Publishing...' : 'Save & Publish to Farmer App'}
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          {statusBanner}
        </div>
      )}

      {/* Form Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Executive Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-900)' }}>
            1. Executive Agronomy Recommendation Summary
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
          />
        </div>

        {/* Section 2: Recommended Varieties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-900)' }}>
            2. Recommended Orchard Crops & Hybrid Varieties
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {varieties.map((v, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1.2fr', gap: '0.5rem' }}>
                <input
                  placeholder="Crop (e.g. Mango)"
                  value={v.crop}
                  onChange={(e) => {
                    const copy = [...varieties];
                    copy[idx].crop = e.target.value;
                    setVarieties(copy);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
                <input
                  placeholder="Variety (e.g. Kesar Grafted)"
                  value={v.variety}
                  onChange={(e) => {
                    const copy = [...varieties];
                    copy[idx].variety = e.target.value;
                    setVarieties(copy);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
                <input
                  placeholder="Yield / Acre"
                  value={v.yieldPerAcre}
                  onChange={(e) => {
                    const copy = [...varieties];
                    copy[idx].yieldPerAcre = e.target.value;
                    setVarieties(copy);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
                <input
                  placeholder="Planting Season"
                  value={v.plantingSeason}
                  onChange={(e) => {
                    const copy = [...varieties];
                    copy[idx].plantingSeason = e.target.value;
                    setVarieties(copy);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Plant Spacing & Geometry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-900)' }}>
            3. Plant Spacing & Density Geometry
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Row-to-Row Spacing (m)</span>
              <input
                type="number"
                step="0.5"
                value={rowSpacing}
                onChange={(e) => setRowSpacing(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plant-to-Plant Spacing (m)</span>
              <input
                type="number"
                step="0.5"
                value={plantSpacing}
                onChange={(e) => setPlantSpacing(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Plant Population</span>
              <input
                type="number"
                value={totalPlants}
                onChange={(e) => setTotalPlants(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4 & 5: Soil Preparation & Fertilizers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              4. Soil Preparation & Pit Treatment
            </label>
            <textarea
              rows={4}
              value={soilTreatment}
              onChange={(e) => setSoilTreatment(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              5. Fertilizer & Fertigation Schedule
            </label>
            <textarea
              rows={4}
              value={fertilizerSchedule}
              onChange={(e) => setFertilizerSchedule(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Section 6 & 7: Drip Layout & Estimated Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              6. Drip Layout & Water Requirement
            </label>
            <textarea
              rows={3}
              value={dripLayout}
              onChange={(e) => setDripLayout(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              7. Estimated Cost & Setup Budget (INR)
            </label>
            <input
              type="number"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(Number(e.target.value))}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-800)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Includes saplings, drip system, labor & pits</span>
          </div>
        </div>

        {/* Section 8 & 9: ROI & Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              8. 5-Year Financial ROI & Yield Projections
            </label>
            <textarea
              rows={3}
              value={projectedRoi}
              onChange={(e) => setProjectedRoi(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              9. Month-by-Month Plantation Timeline
            </label>
            <textarea
              rows={3}
              value={implementationTimeline}
              onChange={(e) => setImplementationTimeline(e.target.value)}
              style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Section 10, 11, 12: Diseases, Government Schemes & Maintenance Calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-900)' }}>
              10. Diseases & Pests to Watch
            </label>
            <textarea
              rows={4}
              value={pestControl}
              onChange={(e) => setPestControl(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-900)' }}>
              11. Government Schemes & Subsidies
            </label>
            <textarea
              rows={4}
              value={governmentSchemes}
              onChange={(e) => setGovernmentSchemes(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-900)' }}>
              12. Annual Maintenance Calendar
            </label>
            <textarea
              rows={4}
              value={maintenanceCalendar}
              onChange={(e) => setMaintenanceCalendar(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.75rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
