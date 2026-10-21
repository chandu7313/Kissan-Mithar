import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Send,
  Zap,
  Info,
} from 'lucide-react';
import {
  DiseaseTreatmentPayload,
  ChemicalTreatmentItem,
} from '../../api/serviceOperations.api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (treatment: DiseaseTreatmentPayload) => Promise<void>;
  initialTreatment?: DiseaseTreatmentPayload | null;
  cropType?: string;
  affectedPart?: string;
}

interface PathologyPreset {
  label: string;
  diseaseName: string;
  causalOrganism: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosisSummary: string;
  immediateAction: string;
  chemicalTreatment: ChemicalTreatmentItem[];
  organicTreatment: string;
  preventativeMeasures: string;
  followUpDays: number;
  estimatedCost: number;
}

const PRESETS: PathologyPreset[] = [
  {
    label: 'Apple Scab (Venturia inaequalis)',
    diseaseName: 'Apple Scab (Venturia inaequalis)',
    causalOrganism: 'Venturia inaequalis (Cooke) G. Winter',
    severity: 'HIGH',
    diagnosisSummary:
      'Diagnostic dark-olive velvety lesions observed on leaf surfaces and sepals, indicating active ascospore inoculation following recent precipitation.',
    immediateAction:
      'Immediately prune heavily blighted leaf clusters and incinerate. Restrict sprinkler irrigation to keep canopy foliage dry.',
    chemicalTreatment: [
      {
        chemicalName: 'Difenoconazole 25% EC',
        commercialBrand: 'Score 250 EC',
        dosage: '0.3 ml per litre of water (30ml/100L)',
        applicationMethod: 'Curative high-pressure canopy spray',
        waitingPeriodDays: 14,
      },
      {
        chemicalName: 'Mancozeb 75% WP',
        commercialBrand: 'Dithane M-45',
        dosage: '2.5 g per litre of water',
        applicationMethod: 'Protective broad-spectrum cover spray',
        waitingPeriodDays: 21,
      },
    ],
    organicTreatment:
      'Neem Seed Kernel Extract (NSKE 5%) or Trichoderma viride @ 5g/L water applied as preventative wash.',
    preventativeMeasures:
      'Ensure winter pruning clears inner canopy for air movement. Spray 5% Urea prior to leaf fall in autumn to hasten leaf decomposition.',
    followUpDays: 7,
    estimatedCost: 1850,
  },
  {
    label: 'Alternaria Leaf Blotch (Alternaria mali)',
    diseaseName: 'Alternaria Leaf Blotch (Alternaria mali)',
    causalOrganism: 'Alternaria alternata f. sp. mali',
    severity: 'MEDIUM',
    diagnosisSummary:
      'Circular necrotic lesions with distinctive reddish-purple halos ("frog-eye" symptom) spreading across mature foliage.',
    immediateAction:
      'Remove heavily spotted lower leaves and improve orchard soil drainage to reduce humidity.',
    chemicalTreatment: [
      {
        chemicalName: 'Propineb 70% WP',
        commercialBrand: 'Antracol 70 WP',
        dosage: '2.0 g per litre of water',
        applicationMethod: 'Protective foliar cover spray',
        waitingPeriodDays: 15,
      },
      {
        chemicalName: 'Pyraclostrobin 20% WG',
        commercialBrand: 'Headline 20 WG',
        dosage: '0.5 g per litre of water',
        applicationMethod: 'Systemic foliar spray during high-humidity window',
        waitingPeriodDays: 14,
      },
    ],
    organicTreatment:
      'Bordeaux mixture (1%) spray during pre-monsoon stage or Pseudomonas fluorescens wash.',
    preventativeMeasures:
      'Avoid high-nitrogen overfertilization which produces excessive succulent foliage prone to infection.',
    followUpDays: 10,
    estimatedCost: 1600,
  },
  {
    label: 'Powdery Mildew (Podosphaera leucotricha)',
    diseaseName: 'Powdery Mildew (Podosphaera leucotricha)',
    causalOrganism: 'Podosphaera leucotricha (Ellis & Everh.)',
    severity: 'MEDIUM',
    diagnosisSummary:
      'White powdery fungal growth covering young tender shoots and distorted curled leaves.',
    immediateAction:
      'Clip off silvered terminal mildewed shoots and burn outside the orchard boundary.',
    chemicalTreatment: [
      {
        chemicalName: 'Hexaconazole 5% EC',
        commercialBrand: 'Contaf 5 EC',
        dosage: '1.0 ml per litre of water',
        applicationMethod: 'Systemic canopy spray covering both leaf surfaces',
        waitingPeriodDays: 14,
      },
      {
        chemicalName: 'Wettable Sulphur 80% WP',
        commercialBrand: 'Sulfex 80 WP',
        dosage: '3.0 g per litre of water',
        applicationMethod: 'Contact protective foliar spray',
        waitingPeriodDays: 7,
      },
    ],
    organicTreatment:
      'Baking soda (Potassium bicarbonate) spray @ 3g/L or Horticultural mineral oil @ 1.5%.',
    preventativeMeasures:
      'Perform rigorous winter pruning to remove dormant overwintering buds carrying mycelium.',
    followUpDays: 10,
    estimatedCost: 1200,
  },
  {
    label: 'Collar Rot / Crown Rot (Phytophthora cactorum)',
    diseaseName: 'Collar Rot & Root Blight (Phytophthora cactorum)',
    causalOrganism: 'Phytophthora cactorum oomycete',
    severity: 'CRITICAL',
    diagnosisSummary:
      'Water-soaked dark lesions and rotting bark at the trunk base near soil line with declining canopy foliage.',
    immediateAction:
      'Remove soil from around the trunk base down to main roots to allow sun drying. Scrape dead diseased bark down to healthy green tissue.',
    chemicalTreatment: [
      {
        chemicalName: 'Metalaxyl 8% + Mancozeb 64% WP',
        commercialBrand: 'Ridomil Gold MZ 68',
        dosage: '2.5 g per litre of water',
        applicationMethod: 'Rootzone soil drenching (10-15 litres per mature tree basin)',
        waitingPeriodDays: 30,
      },
      {
        chemicalName: 'Copper Oxychloride 50% WP',
        commercialBrand: 'Blitox 50',
        dosage: '30 g in 1 litre water (thick slurry)',
        applicationMethod: 'Collar wound pasting over scraped bark',
        waitingPeriodDays: 14,
      },
    ],
    organicTreatment:
      'Trichoderma harzianum bio-fungicide @ 50g mixed with 5kg decomposed manure placed around trunk basin.',
    preventativeMeasures:
      'Ensure water does not stagnate around root collars. Plant high-grafted trees on clonal rootstocks.',
    followUpDays: 5,
    estimatedCost: 2200,
  },
];

export const DiseaseTreatmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTreatment,
  cropType,
  affectedPart,
}) => {
  const [diseaseName, setDiseaseName] = useState('');
  const [causalOrganism, setCausalOrganism] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalTreatmentItem[]>([]);
  const [organicTreatment, setOrganicTreatment] = useState('');
  const [preventativeMeasures, setPreventativeMeasures] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number | ''>(7);
  const [estimatedCost, setEstimatedCost] = useState<number | ''>(1500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const applyPreset = (preset: PathologyPreset) => {
    setDiseaseName(preset.diseaseName);
    setCausalOrganism(preset.causalOrganism);
    setSeverity(preset.severity);
    setDiagnosisSummary(preset.diagnosisSummary);
    setImmediateAction(preset.immediateAction);
    setChemicals(preset.chemicalTreatment);
    setOrganicTreatment(preset.organicTreatment);
    setPreventativeMeasures(preset.preventativeMeasures);
    setFollowUpDays(preset.followUpDays);
    setEstimatedCost(preset.estimatedCost);
  };

  useEffect(() => {
    if (initialTreatment) {
      setDiseaseName(initialTreatment.diseaseName || '');
      setCausalOrganism(initialTreatment.causalOrganism || '');
      setSeverity(initialTreatment.severity || 'MEDIUM');
      setDiagnosisSummary(initialTreatment.diagnosisSummary || '');
      setImmediateAction(initialTreatment.immediateAction || '');
      setChemicals(
        initialTreatment.chemicalTreatment && initialTreatment.chemicalTreatment.length > 0
          ? initialTreatment.chemicalTreatment
          : PRESETS[0].chemicalTreatment
      );
      setOrganicTreatment(initialTreatment.organicTreatment || '');
      setPreventativeMeasures(initialTreatment.preventativeMeasures || '');
      setFollowUpDays(
        initialTreatment.followUpDays !== undefined && initialTreatment.followUpDays !== null
          ? initialTreatment.followUpDays
          : 7
      );
      setEstimatedCost(
        initialTreatment.estimatedCost !== undefined && initialTreatment.estimatedCost !== null
          ? initialTreatment.estimatedCost
          : 1500
      );
    } else {
      // Default to Apple Scab preset
      applyPreset(PRESETS[0]);
    }
    setErrorMsg('');
  }, [initialTreatment, isOpen, cropType, affectedPart]);

  if (!isOpen) return null;

  const handleAddChemical = () => {
    setChemicals([
      ...chemicals,
      {
        chemicalName: '',
        commercialBrand: '',
        dosage: '',
        applicationMethod: 'Foliar spray',
        waitingPeriodDays: 14,
      },
    ]);
  };

  const handleRemoveChemical = (index: number) => {
    if (chemicals.length <= 1) return;
    setChemicals(chemicals.filter((_, i) => i !== index));
  };

  const handleUpdateChemical = (
    index: number,
    field: keyof ChemicalTreatmentItem,
    value: any
  ) => {
    const updated = [...chemicals];
    updated[index] = { ...updated[index], [field]: value };
    setChemicals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName.trim() || diseaseName.length < 3) {
      setErrorMsg('Please specify the disease name (min 3 characters).');
      return;
    }
    if (!diagnosisSummary.trim() || diagnosisSummary.length < 10) {
      setErrorMsg('Please enter a clinical diagnosis summary (min 10 characters).');
      return;
    }
    if (!immediateAction.trim() || immediateAction.length < 5) {
      setErrorMsg('Please enter immediate emergency steps (min 5 characters).');
      return;
    }

    for (let i = 0; i < chemicals.length; i++) {
      if (!chemicals[i].chemicalName.trim() || !chemicals[i].dosage.trim()) {
        setErrorMsg(`Please specify chemical name and dosage for prescription #${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        diseaseName: diseaseName.trim(),
        causalOrganism: causalOrganism.trim() || undefined,
        severity,
        diagnosisSummary: diagnosisSummary.trim(),
        immediateAction: immediateAction.trim(),
        chemicalTreatment: chemicals,
        organicTreatment: organicTreatment.trim() || undefined,
        preventativeMeasures: preventativeMeasures.trim() || undefined,
        followUpDays: typeof followUpDays === 'number' ? followUpDays : 7,
        estimatedCost: typeof estimatedCost === 'number' ? estimatedCost : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('[DiseaseTreatmentModal] Submit error:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to submit pathology treatment plan.');
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
            backgroundColor: '#fff7ed',
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
                backgroundColor: '#fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c2410c',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Plant Pathology Prescription & Control Plan
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Issue scientific chemical and biological disease control instructions to farmer.
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
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Picker */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Zap size={16} color="#c2410c" />
              <strong style={{ color: '#0f172a' }}>Quick Pathology Presets:</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  {preset.label.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Disease Identification & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 0.8fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Diagnosed Disease *
              </label>
              <input
                type="text"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                placeholder="e.g. Apple Scab (Venturia inaequalis)"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Causal Pathogen / Organism
              </label>
              <input
                type="text"
                value={causalOrganism}
                onChange={(e) => setCausalOrganism(e.target.value)}
                placeholder="e.g. Venturia inaequalis fungus"
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
                Blight Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor:
                    severity === 'CRITICAL' ? '#fef2f2' : severity === 'HIGH' ? '#fff7ed' : '#ffffff',
                  color:
                    severity === 'CRITICAL' ? '#dc2626' : severity === 'HIGH' ? '#c2410c' : '#15803d',
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Diagnosis & Immediate Emergency Action */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Pathological Findings & Diagnosis Summary *
              </label>
              <textarea
                rows={2}
                value={diagnosisSummary}
                onChange={(e) => setDiagnosisSummary(e.target.value)}
                placeholder="Clinical description of symptoms, leaf spotting pattern, spore progression..."
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
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.25rem' }}>
                Immediate Emergency Action for Farmer *
              </label>
              <textarea
                rows={2}
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                placeholder="e.g. Stop flood irrigation immediately; prune and incinerate all spotted shoots..."
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  backgroundColor: '#fff5f5',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Chemical Fungicide / Pesticide Prescriptions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Chemical Prescriptions & Fungicides ({chemicals.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  List recommended active chemical, commercial trade names, precise dosage, and Pre-Harvest Interval (PHI).
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddChemical}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Add Chemical Treatment</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chemicals.map((chem, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 0.6fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={chem.chemicalName}
                    onChange={(e) => handleUpdateChemical(idx, 'chemicalName', e.target.value)}
                    placeholder="Chemical (e.g. Difenoconazole 25% EC)"
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
                    value={chem.commercialBrand}
                    onChange={(e) => handleUpdateChemical(idx, 'commercialBrand', e.target.value)}
                    placeholder="Brand (e.g. Score)"
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
                    value={chem.dosage}
                    onChange={(e) => handleUpdateChemical(idx, 'dosage', e.target.value)}
                    placeholder="Dosage (e.g. 0.3ml/L)"
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
                    value={chem.applicationMethod}
                    onChange={(e) => handleUpdateChemical(idx, 'applicationMethod', e.target.value)}
                    placeholder="Method (e.g. Canopy foliar spray)"
                    style={{
                      padding: '0.375rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    value={chem.waitingPeriodDays || ''}
                    onChange={(e) =>
                      handleUpdateChemical(
                        idx,
                        'waitingPeriodDays',
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                    placeholder="PHI Days"
                    title="Pre-Harvest Interval (Days)"
                    style={{
                      padding: '0.375rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveChemical(idx)}
                    disabled={chemicals.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: chemicals.length <= 1 ? '#cbd5e1' : '#dc2626',
                      cursor: chemicals.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Organic / Bio-Fungicides & Cultural Measures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Organic & Bio-Control Measures
              </label>
              <textarea
                rows={2}
                value={organicTreatment}
                onChange={(e) => setOrganicTreatment(e.target.value)}
                placeholder="e.g. Neem seed kernel extract (5%), Trichoderma viride wash..."
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
                Cultural & Preventative Orchard Practices
              </label>
              <textarea
                rows={2}
                value={preventativeMeasures}
                onChange={(e) => setPreventativeMeasures(e.target.value)}
                placeholder="e.g. Canopy aeration via summer pruning, clearing fallen leaves, balanced irrigation..."
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

          {/* Follow-up & Estimated Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Recommended Follow-up Inspection (Days)
              </label>
              <input
                type="number"
                min="1"
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="7"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                Estimated Treatment Cost (₹)
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
                  step="50"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1500"
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
                backgroundColor: '#c2410c',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Dispatching Prescription...' : 'Dispatch Pathology Prescription to Farmer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
