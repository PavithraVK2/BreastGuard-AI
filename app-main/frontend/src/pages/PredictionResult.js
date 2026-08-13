import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  Brain,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const benignSteps = [
  'Continue routine monthly self-examination.',
  'Schedule a follow-up mammogram or clinical breast exam in 6–12 months.',
  'Maintain a balanced diet, regular exercise, and healthy body weight.',
  'Report any new lumps, skin dimpling or nipple changes to your physician immediately.',
  'Review family history and consider periodic screening if hereditary risk is present.',
];

const malignantSteps = [
  'Refer patient to an oncologist for confirmatory core-needle biopsy and staging.',
  'Order imaging: bilateral mammography + breast MRI to evaluate extent.',
  'Discuss multidisciplinary treatment options — surgery, radiation, chemotherapy or targeted therapy.',
  'Offer genetic counselling (BRCA1/BRCA2) if family history or early onset.',
  'Arrange psychological support and provide a second opinion pathway.',
];

const PredictionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [reasoning, setReasoning] = useState([]);

  useEffect(() => {
    if (!location.state?.prediction) {
      navigate('/dashboard');
      return;
    }
    setPrediction(location.state.prediction);
    setReasoning(location.state.reasoning || []);
  }, [location, navigate]);

  if (!prediction) return null;

  const isMalignant = prediction.result === 'Malignant';
  const confidence = (prediction.confidence * 100).toFixed(1);
  const nextSteps = isMalignant ? malignantSteps : benignSteps;

  return (
    <div
      className="min-h-screen bg-[#F0F9FF]"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
    >
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-[#0284C7] hover:underline mb-4 text-sm"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>

        {/* Header verdict card */}
        <div
          className="bg-white rounded-lg border border-slate-200 p-6 mb-4"
          data-testid="verdict-card"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isMalignant ? 'bg-[#FEE2E2]' : 'bg-[#D1FAE5]'
                }`}
              >
                {isMalignant ? (
                  <AlertCircle className="w-8 h-8 text-[#EF4444]" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                  AI Prediction Result
                </p>
                <h1
                  className={`text-3xl font-bold ${
                    isMalignant ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  data-testid="prediction-result-label"
                >
                  {prediction.result}
                </h1>
                <p className="text-sm text-[#475569] mt-0.5">
                  Case&nbsp;
                  <span className="font-semibold text-[#0F172A]">
                    {prediction.patient_name}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-[#475569] font-semibold mb-1">
                Model Confidence
              </p>
              <div className="flex items-center space-x-2 justify-end">
                <TrendingUp className="w-5 h-5 text-[#0284C7]" />
                <p
                  className="text-2xl font-bold text-[#0F172A]"
                  data-testid="prediction-confidence"
                >
                  {confidence}%
                </p>
              </div>
              <div className="w-40 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2 ml-auto">
                <div
                  className={`h-full rounded-full ${
                    isMalignant ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${confidence}%` }}
                  data-testid="confidence-bar"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Reasoning */}
          <div
            className="bg-white rounded-lg border border-slate-200 p-5"
            data-testid="ai-reasoning-card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-[#E0F2FE] rounded-md flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  AI Analyzer — Reasoning
                </h2>
                <p className="text-xs text-[#475569]">
                  Top biopsy features that drove this{' '}
                  <span className="font-semibold">{prediction.result}</span> verdict
                </p>
              </div>
            </div>

            {reasoning.length === 0 ? (
              <p className="text-sm text-[#475569] italic">
                Feature-level reasoning is available only for freshly submitted predictions.
              </p>
            ) : (
              <div className="space-y-3" data-testid="reasoning-list">
                {reasoning.map((r, idx) => {
                  const pct = Math.max(0, Math.min(100, r.deviation * 100));
                  const barColor = isMalignant ? '#EF4444' : '#10B981';
                  return (
                    <div
                      key={r.label + idx}
                      className="border border-slate-100 rounded-md p-3"
                      data-testid={`reasoning-item-${idx}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-[#0F172A]">
                          {r.label}
                        </span>
                        <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                          {r.value}
                        </span>
                      </div>
                      <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#475569]">
                        <span>Benign ~ {r.benign}</span>
                        <span>Malignant ~ {r.malignant}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Next Steps */}
          <div
            className="bg-white rounded-lg border border-slate-200 p-5"
            data-testid="next-steps-card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center ${
                  isMalignant ? 'bg-[#FEE2E2]' : 'bg-[#D1FAE5]'
                }`}
              >
                <Stethoscope
                  className={`w-5 h-5 ${
                    isMalignant ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}
                />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Recommended Next Steps
                </h2>
                <p className="text-xs text-[#475569]">
                  Suggested clinical actions for this patient
                </p>
              </div>
            </div>

            <ul className="space-y-2.5" data-testid="next-steps-list">
              {nextSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-2 text-sm text-[#0F172A]"
                  data-testid={`next-step-${idx}`}
                >
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isMalignant ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                    }`}
                  ></span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>

            <div
              className={`mt-4 p-3 rounded-md text-xs leading-relaxed ${
                isMalignant
                  ? 'bg-red-50 border border-red-200 text-[#B91C1C]'
                  : 'bg-green-50 border border-green-200 text-[#047857]'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-semibold mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Clinical Note</span>
              </div>
              {isMalignant
                ? 'This is an AI-assisted prediction and does NOT constitute a diagnosis. Confirmatory biopsy and specialist review are mandatory before treatment.'
                : 'This result suggests low malignancy risk. Regular monitoring remains essential — this AI output is a decision-support signal, not a definitive diagnosis.'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs text-[#475569]">
          <div>
            Prediction ID:{' '}
            <span className="font-mono text-[#0F172A]">
              {prediction.prediction_id}
            </span>
            <span className="mx-2">·</span>
            {new Date(prediction.created_at).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <Link to="/prediction">
              <Button
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-md px-6 transition-colors duration-200"
                data-testid="new-prediction-button"
              >
                New Diagnosis
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                data-testid="view-history-button"
              >
                View Records
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
