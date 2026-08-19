import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Microscope,
  Activity,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'}/api`;

const featureConfig = {
  mean: [
    { key: 'radius_mean', label: 'Radius', min: 6.98, max: 28.11, benign: 12.15, malignant: 18.35, step: 0.01 },
    { key: 'texture_mean', label: 'Texture', min: 9.71, max: 39.28, benign: 17.91, malignant: 21.85, step: 0.01 },
    { key: 'perimeter_mean', label: 'Perimeter', min: 43.79, max: 188.5, benign: 78.15, malignant: 120.36, step: 0.01 },
    { key: 'area_mean', label: 'Area', min: 143.5, max: 2501, benign: 462.79, malignant: 1058.4, step: 0.1 },
    { key: 'smoothness_mean', label: 'Smoothness', min: 0.052, max: 0.163, benign: 0.092, malignant: 0.103, step: 0.001 },
    { key: 'compactness_mean', label: 'Compactness', min: 0.019, max: 0.345, benign: 0.08, malignant: 0.145, step: 0.001 },
    { key: 'concavity_mean', label: 'Concavity', min: 0, max: 0.427, benign: 0.046, malignant: 0.16, step: 0.001 },
    { key: 'concave_points_mean', label: 'Concave Points', min: 0, max: 0.201, benign: 0.026, malignant: 0.088, step: 0.001 },
    { key: 'symmetry_mean', label: 'Symmetry', min: 0.106, max: 0.304, benign: 0.174, malignant: 0.193, step: 0.001 },
    { key: 'fractal_dimension_mean', label: 'Fractal Dimension', min: 0.049, max: 0.097, benign: 0.063, malignant: 0.063, step: 0.001 },
  ],
  se: [
    { key: 'radius_se', label: 'Radius (SE)', min: 0.11, max: 2.87, benign: 0.284, malignant: 0.61, step: 0.001 },
    { key: 'texture_se', label: 'Texture (SE)', min: 0.36, max: 4.88, benign: 1.22, malignant: 1.21, step: 0.001 },
    { key: 'perimeter_se', label: 'Perimeter (SE)', min: 0.75, max: 21.98, benign: 2.0, malignant: 4.32, step: 0.001 },
    { key: 'area_se', label: 'Area (SE)', min: 6.8, max: 542.2, benign: 21.14, malignant: 72.67, step: 0.01 },
    { key: 'smoothness_se', label: 'Smoothness (SE)', min: 0.001, max: 0.031, benign: 0.007, malignant: 0.007, step: 0.0001 },
    { key: 'compactness_se', label: 'Compactness (SE)', min: 0.002, max: 0.135, benign: 0.021, malignant: 0.032, step: 0.0001 },
    { key: 'concavity_se', label: 'Concavity (SE)', min: 0, max: 0.396, benign: 0.026, malignant: 0.042, step: 0.0001 },
    { key: 'concave_points_se', label: 'Concave Points (SE)', min: 0, max: 0.052, benign: 0.009, malignant: 0.015, step: 0.0001 },
    { key: 'symmetry_se', label: 'Symmetry (SE)', min: 0.007, max: 0.078, benign: 0.021, malignant: 0.02, step: 0.0001 },
    { key: 'fractal_dimension_se', label: 'Fractal Dimension (SE)', min: 0.001, max: 0.029, benign: 0.004, malignant: 0.004, step: 0.0001 },
  ],
  worst: [
    { key: 'radius_worst', label: 'Radius (Worst)', min: 7.93, max: 36.04, benign: 13.38, malignant: 21.13, step: 0.01 },
    { key: 'texture_worst', label: 'Texture (Worst)', min: 12.02, max: 49.54, benign: 23.51, malignant: 29.32, step: 0.01 },
    { key: 'perimeter_worst', label: 'Perimeter (Worst)', min: 50.41, max: 251.2, benign: 87.01, malignant: 141.37, step: 0.01 },
    { key: 'area_worst', label: 'Area (Worst)', min: 185.2, max: 4254, benign: 558.9, malignant: 1422.29, step: 0.1 },
    { key: 'smoothness_worst', label: 'Smoothness (Worst)', min: 0.071, max: 0.222, benign: 0.125, malignant: 0.145, step: 0.001 },
    { key: 'compactness_worst', label: 'Compactness (Worst)', min: 0.027, max: 1.058, benign: 0.182, malignant: 0.375, step: 0.001 },
    { key: 'concavity_worst', label: 'Concavity (Worst)', min: 0, max: 1.252, benign: 0.166, malignant: 0.451, step: 0.001 },
    { key: 'concave_points_worst', label: 'Concave Points (Worst)', min: 0, max: 0.291, benign: 0.074, malignant: 0.182, step: 0.001 },
    { key: 'symmetry_worst', label: 'Symmetry (Worst)', min: 0.156, max: 0.664, benign: 0.27, malignant: 0.323, step: 0.001 },
    { key: 'fractal_dimension_worst', label: 'Fractal Dimension (Worst)', min: 0.055, max: 0.208, benign: 0.079, malignant: 0.092, step: 0.001 },
  ],
};

const PredictionForm = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState(`PT-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState(() => {
    const initial = {};
    ['mean', 'se', 'worst'].forEach((group) => {
      featureConfig[group].forEach((f) => {
        initial[f.key] = f.benign;
      });
    });
    return initial;
  });

  const handleSliderChange = (key, newValue) => {
    setValues((prev) => ({ ...prev, [key]: newValue[0] }));
  };

  const applyPreset = (type) => {
    const preset = {};
    ['mean', 'se', 'worst'].forEach((group) => {
      featureConfig[group].forEach((f) => {
        preset[f.key] = type === 'benign' ? f.benign : f.malignant;
      });
    });
    setValues(preset);
    toast.success(`Loaded sample ${type} preset`);
  };

  const getStepDecimals = (step) => {
    const s = step.toString();
    const dotIdx = s.indexOf('.');
    return dotIdx === -1 ? 0 : s.length - dotIdx - 1;
  };

  const formatValue = (value, step) => Number(value).toFixed(getStepDecimals(step));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const orderedFeatures = [
        ...featureConfig.mean.map((f) => values[f.key]),
        ...featureConfig.se.map((f) => values[f.key]),
        ...featureConfig.worst.map((f) => values[f.key]),
      ];
      const token = localStorage.getItem("session_token");
      console.log("TOKEN:", token);
      const response = await axios.post(
  `${API}/predictions`,
  {
    features: orderedFeatures,
    patient_name: patientId || "Anonymous",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }
);
      // Compute AI reasoning — top features that pushed classification.
      // Positive deviation => toward malignant; negative => toward benign.
      const isMalignant = response.data.result === 'Malignant';
      const allFeatures = [
        ...featureConfig.mean,
        ...featureConfig.se,
        ...featureConfig.worst,
      ];
      const scored = allFeatures.map((f) => {
        const v = values[f.key];
        const range = f.malignant - f.benign;
        const deviation = range === 0 ? 0 : (v - f.benign) / range; // 0 = benign, 1 = malignant
        return {
          label: f.label,
          value: Number(v).toFixed(3),
          benign: f.benign,
          malignant: f.malignant,
          deviation,
        };
      });
      // Sort so top drivers of predicted class come first.
      scored.sort((a, b) =>
        isMalignant ? b.deviation - a.deviation : a.deviation - b.deviation
      );
      const reasoning = scored.slice(0, 5);

      toast.success('Diagnosis complete!');
      navigate('/result', {
        state: { prediction: response.data, reasoning },
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSliderGrid = (groupKey) => {
    const items = featureConfig[groupKey];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5" data-testid={`slider-group-${groupKey}`}>
        {items.map((f) => (
          <div key={f.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Label htmlFor={f.key} className="text-sm font-medium text-[#0F172A]">
                  {f.label}
                </Label>
                <HelpCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
              <span
                className="text-sm font-bold text-[#0F172A] tabular-nums"
                data-testid={`slider-value-${f.key}`}
              >
                {formatValue(values[f.key], f.step)}
              </span>
            </div>
            <Slider
              id={f.key}
              data-testid={`slider-${f.key}`}
              min={f.min}
              max={f.max}
              step={f.step}
              value={[values[f.key]]}
              onValueChange={(v) => handleSliderChange(f.key, v)}
              className="[&_[role=slider]]:bg-[#0284C7] [&_[role=slider]]:border-[#0284C7] [&_.bg-primary]:bg-[#0284C7]"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="prediction-form-title"
          >
            SVM Diagnostics Portal
          </h1>
          <p className="text-sm text-[#475569]">
            Simulate AI Support Vector Machine classification using full cell nuclei biopsy characteristics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left side - measurements profile */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#E0F2FE] rounded-md flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Biopsy Measurements Profile
                  </h2>
                  <p className="text-xs text-[#475569]">30 highly detailed cancer features categorized dynamically</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => applyPreset('benign')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D1FAE5] text-[#059669] border border-[#10B981] rounded-full text-xs font-semibold hover:bg-[#A7F3D0] transition-colors duration-200"
                  data-testid="preset-benign-button"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Sample Benign</span>
                </button>
                <button
                  onClick={() => applyPreset('malignant')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444] rounded-full text-xs font-semibold hover:bg-[#FECACA] transition-colors duration-200"
                  data-testid="preset-malignant-button"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Sample Malignant</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-4">
              <div>
                <Label htmlFor="patient-id" className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                  Internal Case ID
                </Label>
                <Input
                  id="patient-id"
                  data-testid="patient-name-input"
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="mt-2 focus:ring-2 focus:ring-[#0284C7] border-slate-200"
                />
              </div>
              <div className="lg:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-[#475569] font-semibold mb-2 block">
                  Evaluation Category Grouping
                </Label>
                <Tabs defaultValue="mean" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[#F1F5F9]">
                    <TabsTrigger value="mean" data-testid="tab-mean" className="data-[state=active]:bg-white data-[state=active]:text-[#0284C7]">
                      Mean values
                    </TabsTrigger>
                    <TabsTrigger value="se" data-testid="tab-se" className="data-[state=active]:bg-white data-[state=active]:text-[#0284C7]">
                      Standard Errors
                    </TabsTrigger>
                    <TabsTrigger value="worst" data-testid="tab-worst" className="data-[state=active]:bg-white data-[state=active]:text-[#0284C7]">
                      Worst (Largest)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="mean" className="pt-6">
                    {renderSliderGrid('mean')}
                  </TabsContent>
                  <TabsContent value="se" className="pt-6">
                    {renderSliderGrid('se')}
                  </TabsContent>
                  <TabsContent value="worst" className="pt-6">
                    {renderSliderGrid('worst')}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200">
              <p className="text-xs text-[#475569]">
                Drag sliders or use presets to populate case values.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-md px-8 transition-colors duration-200"
                  data-testid="predict-button"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run AI Diagnosis'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Inference Model Engine + Interactive Preset Assist */}
            <div className="bg-white rounded-lg border border-slate-200 p-5" data-testid="inference-model-engine-card">
              <div className="flex items-center space-x-2 mb-3">
                <Cpu className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-semibold text-[#0F172A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Inference Model Engine
                </h3>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-4">
                The support vector classifier separates malignant tissues based on linear hyperplane configurations. Increasing the values of tumor indicators like{' '}
                <span className="font-semibold text-[#0F172A]">concavity worst</span> or{' '}
                <span className="font-semibold text-[#0F172A]">perimeter worst</span> shifts the patient evaluation margin deeply into the malignant diagnosis domain.
              </p>

              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-md p-3">
                <div className="flex items-start space-x-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-[#92400E]">Interactive Preset Assist</h4>
                </div>
                <p className="text-xs text-[#92400E] leading-relaxed">
                  You can use the automated sample presets at the top to instantaneously populate high-malignancy and benign cases to evaluate how the system handles border cases.
                </p>
              </div>
            </div>

            {/* Biopsy Inspection Standard */}
            <div className="bg-[#0F172A] rounded-lg p-5" data-testid="biopsy-inspection-standard-card">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Biopsy Inspection Standard
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Input measurements represent digitized parameters derived directly from fine needle aspirates (FNA) of breast masses. Fine-tuning coordinates dynamically simulates real cell nuclei geometry across all 30 Wisconsin diagnostic features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;
