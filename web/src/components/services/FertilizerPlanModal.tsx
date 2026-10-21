import React, { useState, useEffect } from 'react';
import {
  X,
  Sprout,
  Plus,
  Trash2,
  Calendar,
  Layers,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  FertilizerPlanPayload,
  FertilizerScheduleStage,
} from '../../api/serviceOperations.api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: FertilizerPlanPayload) => Promise<void>;
  initialPlan?: FertilizerPlanPayload | null;
  cropType?: string;
  landAcres?: number | null;
}

const DEFAULT_STAGES: FertilizerScheduleStage[] = [
  {
    stage: 'Silver Tip to Green Tip',
    timing: 'Early Spring (March)',
    fertilizers: [
      { name: 'Urea (46% N)', dosage: '250g per mature tree', method: 'Soil broadcast around drip line' },
      { name: 'Zinc Sulphate 0.5%', dosage: '500g / 100L water', method: 'Foliar spray' },
    ],
    notes: 'Apply soil fertilizer when rootzone soil moisture is adequate.',
  },
  {
    stage: 'Petal Fall & Fruit Set',
    timing: 'May',
    fertilizers: [
      { name: 'NPK 12:32:16 Complex', dosage: '350g per mature tree', method: 'Circular ring trench placement' },
      { name: 'Solubor / Boron 20%', dosage: '100g / 100L water', method: 'Foliar spray' },
    ],
    notes: 'Improves cell division and prevents premature fruitlet drop.',
  },
  {
    stage: 'Fruit Development & Sizing',
    timing: 'Late June - July',
    fertilizers: [
      { name: 'Potassium Nitrate (13-0-45)', dosage: '1.5 kg / 100L water', method: 'Foliar spray' },
      { name: 'Calcium Nitrate', dosage: '200g / 100L water', method: 'Foliar spray' },
    ],
    notes: 'Enhances fruit firmness, color intensity, and storage shelf-life.',
  },
];

export const FertilizerPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPlan,
  cropType,
  landAcres,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [summary, setSummary] = useState('');
  const [stages, setStages] = useState<FertilizerScheduleStage[]>(DEFAULT_STAGES);
  const [organicAlternatives, setOrganicAlternatives] = useState('');
  const [soilTreatment, setSoilTreatment] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | ''>(4500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setDiagnosis(initialPlan.diagnosis || '');
      setSummary(initialPlan.summary || '');
      setStages(
        initialPlan.schedule && initialPlan.schedule.length > 0
          ? initialPlan.schedule
          : DEFAULT_STAGES
      );
      setOrganicAlternatives(initialPlan.organicAlternatives || '');
      setSoilTreatment(initialPlan.soilTreatment || '');
      setPrecautions(initialPlan.precautions || '');
      setEstimatedBudget(
        initialPlan.estimatedBudget !== undefined && initialPlan.estimatedBudget !== null
          ? initialPlan.estimatedBudget
          : 4500
      );
    } else {
      setDiagnosis('Soil Nutrient Balancing & Canopy Micronutrient Optimization');
      setSummary(
        `Comprehensive 3-stage nutritional replenishment program tailored for ${
          cropType || 'Crop'
        }${landAcres ? ` (${landAcres} Acres)` : ''} to promote vigor and high-density yield.`
      );
      setStages(DEFAULT_STAGES);
      setOrganicAlternatives(
        'Well-rotted Farmyard Manure (FYM) @ 25 kg/tree or Vermicompost @ 10 kg/tree during winter dormancy. Jeevamrut soil drenching @ 200L/acre in spring.'
      );
      setSoilTreatment(
        'Apply 1.5 - 2.0 kg Agricultural Lime or Dolomite per tree basin in autumn if soil test indicates acidic pH (< 6.0).'
      );
      setPrecautions(
        'Never mix Zinc Sulphate directly with Phosphatic fertilizers or Copper sprays. Water orchard within 24 hours of soil fertilizer broadcast.'
      );
      setEstimatedBudget(landAcres ? Math.round(landAcres * 2800) : 4500);
    }
    setErrorMsg('');
  }, [initialPlan, isOpen, cropType, landAcres]);

  if (!isOpen) return null;

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        stage: `Stage ${stages.length + 1}`,
        timing: 'Mid Season',
        fertilizers: [{ name: '', dosage: '', method: 'Foliar spray' }],
        notes: '',
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) return;
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleUpdateStage = (
    index: number,
    field: keyof FertilizerScheduleStage,
    value: any
  ) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleAddFertilizer = (stageIndex: number) => {
    const updated = [...stages];
    updated[stageIndex].fertilizers.push({ name: '', dosage: '', method: 'Soil broadcast' });
    setStages(updated);
  };

  const handleRemoveFertilizer = (stageIndex: number, fertIndex: number) => {
    const updated = [...stages];
    if (updated[stageIndex].fertilizers.length <= 1) return;
    updated[stageIndex].fertilizers = updated[stageIndex].fertilizers.filter(
      (_, i) => i !== fertIndex
    );
    setStages(updated);
  };

  const handleUpdateFertilizer = (
    stageIndex: number,
    fertIndex: number,
    field: 'name' | 'dosage' | 'method',
    value: string
  ) => {
    const updated = [...stages];
    updated[stageIndex].fertilizers[fertIndex][field] = value;
    setStages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim() || diagnosis.length < 5) {
      setErrorMsg('Please enter a clinical diagnosis (min 5 characters).');
      return;
    }
    if (!summary.trim() || summary.length < 10) {
      setErrorMsg('Please enter a plan summary (min 10 characters).');
      return;
    }

    // Validate that fertilizers have names
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      for (let j = 0; j < s.fertilizers.length; j++) {
        if (!s.fertilizers[j].name.trim()) {
          setErrorMsg(`Please specify a fertilizer name for ${s.stage || `Stage ${i + 1}`}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        diagnosis: diagnosis.trim(),
        summary: summary.trim(),
        schedule: stages,
        organicAlternatives: organicAlternatives.trim() || undefined,
        soilTreatment: soilTreatment.trim() || undefined,
        precautions: precautions.trim() || undefined,
        estimatedBudget: typeof estimatedBudget === 'number' ? estimatedBudget : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('[FertilizerPlanModal] Submit error:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to submit fertilizer plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        className="animate-scale-up"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
              }}
            >
              <Sprout size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Agronomic Fertilizer Recommendation & Prescription
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Formulate an official multi-stage dosage schedule and dispatch directly to the farmer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            gap: '1.25rem',
          }}
        >
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Context Banner */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: '#166534',
            }}
          >
            <div>
              <strong>Target Crop:</strong> {cropType || 'Apple Orchard'}
              {landAcres ? ` • ${landAcres} Acres` : ''}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
              Standard SKUAST / ICAR Agronomic Framework
            </span>
          </div>

          {/* Diagnosis & Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Agronomic Diagnosis *
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Nitrogen & Zinc deficiency chlorosis with alkaline soil tendencies"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Executive Plan Summary *
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide a clear, farmer-friendly overview of the application schedule..."
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Multi-Stage Schedule Builder */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Crop Stage Fertilizer Schedule ({stages.length} Stages)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Define application timings, specific chemical fertilizers, dosages, and placement methods.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Add Growth Stage</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stages.map((stageItem, stageIdx) => (
                <div
                  key={stageIdx}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                      <input
                        type="text"
                        value={stageItem.stage}
                        onChange={(e) => handleUpdateStage(stageIdx, 'stage', e.target.value)}
                        placeholder="Stage Name (e.g. Pink Bud Stage)"
                        style={{
                          flex: 1.2,
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <input
                        type="text"
                        value={stageItem.timing}
                        onChange={(e) => handleUpdateStage(stageIdx, 'timing', e.target.value)}
                        placeholder="Timing (e.g. Early April)"
                        style={{
                          flex: 0.8,
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStage(stageIdx)}
                      disabled={stages.length <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: stages.length <= 1 ? '#cbd5e1' : '#dc2626',
                        cursor: stages.length <= 1 ? 'not-allowed' : 'pointer',
                        padding: '0.375rem',
                      }}
                      title="Remove Stage"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Fertilizers in this stage */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Fertilizers, Dosages & Application Method:
                    </span>
                    {stageItem.fertilizers.map((fert, fertIdx) => (
                      <div
                        key={fertIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1.2fr 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={fert.name}
                          onChange={(e) =>
                            handleUpdateFertilizer(stageIdx, fertIdx, 'name', e.target.value)
                          }
                          placeholder="Fertilizer Name (e.g. Urea)"
                          required
                          style={{
                            padding: '0.375rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8125rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <input
                          type="text"
                          value={fert.dosage}
                          onChange={(e) =>
                            handleUpdateFertilizer(stageIdx, fertIdx, 'dosage', e.target.value)
                          }
                          placeholder="Dosage (e.g. 200g/tree)"
                          required
                          style={{
                            padding: '0.375rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8125rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                        <select
                          value={fert.method}
                          onChange={(e) =>
                            handleUpdateFertilizer(stageIdx, fertIdx, 'method', e.target.value)
                          }
                          style={{
                            padding: '0.375rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8125rem',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <option value="Soil broadcast">Soil broadcast</option>
                          <option value="Foliar spray">Foliar spray</option>
                          <option value="Ring trench placement">Ring trench</option>
                          <option value="Drip fertigation">Drip fertigation</option>
                          <option value="Soil drench">Soil drench</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveFertilizer(stageIdx, fertIdx)}
                          disabled={stageItem.fertilizers.length <= 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: stageItem.fertilizers.length <= 1 ? '#cbd5e1' : '#94a3b8',
                            cursor: stageItem.fertilizers.length <= 1 ? 'not-allowed' : 'pointer',
                            padding: '0.25rem',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAddFertilizer(stageIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#166534',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: 0,
                        }}
                      >
                        <Plus size={12} />
                        <span>Add Fertilizer to this stage</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={stageItem.notes || ''}
                      onChange={(e) => handleUpdateStage(stageIdx, 'notes', e.target.value)}
                      placeholder="Special instructions for this stage (e.g. Ensure irrigation immediately after application)"
                      style={{
                        padding: '0.375rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px dashed #cbd5e1',
                        fontSize: '0.75rem',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Treatment & Organic Alternatives */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Soil Conditioning & Amendment
              </label>
              <textarea
                rows={2}
                value={soilTreatment}
                onChange={(e) => setSoilTreatment(e.target.value)}
                placeholder="e.g. Agricultural lime (2kg/tree basin), Gypsum, or bio-fertilizers..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Organic & Bio-Alternatives
              </label>
              <textarea
                rows={2}
                value={organicAlternatives}
                onChange={(e) => setOrganicAlternatives(e.target.value)}
                placeholder="e.g. Vermicompost, Well-rotted FYM, Jeevamrut, or Mustard oil cake..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
          </div>

          {/* Precautions & Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Application Precautions & Safety
              </label>
              <input
                type="text"
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                placeholder="e.g. Avoid application during peak midday sun or frost conditions."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Estimated Fertilizer Budget (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="4500"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 1.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              marginTop: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#166534',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Dispatching Plan...' : 'Dispatch Fertilizer Plan to Farmer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
