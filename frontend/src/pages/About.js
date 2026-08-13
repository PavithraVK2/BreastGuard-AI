import React from 'react';
import Navbar from '@/components/Navbar';
import { Settings, Database, GitBranch, TrendingUp, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const featureImportance = [
  { name: 'Concave Points (Worst)', importance: 0.92 },
  { name: 'Perimeter (Worst)', importance: 0.88 },
  { name: 'Radius (Worst)', importance: 0.85 },
  { name: 'Area (Worst)', importance: 0.82 },
  { name: 'Concavity (Mean)', importance: 0.78 },
  { name: 'Concave Points (Mean)', importance: 0.75 },
  { name: 'Perimeter (Mean)', importance: 0.71 },
  { name: 'Area (Mean)', importance: 0.68 },
  { name: 'Radius (Mean)', importance: 0.65 },
  { name: 'Texture (Worst)', importance: 0.52 },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#F0F9FF]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#0F172A] mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="about-title"
          >
            Support Vector Machine (SVM) Mechanics
          </h1>
          <p className="text-sm text-[#475569]">
            Understanding AI classification margins, hyperplanes, and support vectors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Model core concept, equation, feature vector chart */}
          <div className="lg:col-span-2 space-y-4">
            {/* Model Core Concept */}
            <div className="bg-white rounded-lg border border-slate-200 p-6" data-testid="model-core-concept">
              <h2
                className="text-xl font-semibold text-[#0F172A] mb-4"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Model Core Concept
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-5">
                A Support Vector Machine constructs a multidimensional hyperplane that segregates
                different classes of data points with the maximum possible distance. In the context of
                breast tissue oncology diagnostics, the system classifies patient records as either
                Benign (typically smaller, smoother cells) or Malignant (larger, highly irregular
                structures with jagged boundaries).
              </p>

              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Linear Boundary Equation:</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-4 font-mono text-center">
                <span className="text-lg font-semibold text-[#0F172A]">f(x) = W &middot; X + b</span>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Where <span className="font-semibold text-[#0F172A]">W</span> is the optimal weights
                vector, <span className="font-semibold text-[#0F172A]">X</span> represents the normalized
                30 feature biopsy inputs, and <span className="font-semibold text-[#0F172A]">b</span> is
                the hyperplane intercept bias. If the function resolves above zero, the prediction is
                classified Malignant.
              </p>
            </div>

            {/* Feature Vector Contribution Metrics */}
            <div className="bg-white rounded-lg border border-slate-200 p-6" data-testid="feature-importance-chart">
              <h2
                className="text-xl font-semibold text-[#0F172A] mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Feature Vector Contribution Metrics
              </h2>
              <p className="text-sm text-[#475569] mb-5">
                Relative weight of top 10 features in the SVM classification decision
              </p>

              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={featureImportance} layout="vertical" margin={{ top: 8, right: 16, left: 30, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    stroke="#94A3B8"
                    fontSize={11}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#475569"
                    fontSize={11}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(v) => `${(v * 100).toFixed(1)}%`}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 4 ? '#0284C7' : index < 7 ? '#38BDF8' : '#7DD3FC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right sidebar - Model Parameters and Dataset Attributes */}
          <div className="space-y-4">
            {/* Model Parameters */}
            <div className="bg-white rounded-lg border border-slate-200 p-5" data-testid="model-parameters">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-[#0284C7]" />
                <h3
                  className="text-base font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Model Parameters
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">SVM Classifier Type:</span>
                  <span className="text-xs font-bold text-[#0F172A] text-right">C-Support Vector Classification</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">Kernel Parameter:</span>
                  <span className="text-xs font-bold text-[#0F172A] text-right">RBF (optimal for 30 features)</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">Regularization Constant (C):</span>
                  <span className="text-xs font-bold text-[#0F172A] text-right">1.0</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">Probability Outputs:</span>
                  <span className="text-xs font-bold text-[#0F172A] text-right">Platt scaling enabled</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">Features Standard Scaler:</span>
                  <span className="text-xs font-bold text-[#0F172A] text-right">True (Standardized Mean Variance)</span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-xs text-[#475569] font-medium max-w-[45%]">Training Accuracy:</span>
                  <span className="text-xs font-bold text-[#10B981] text-right">98.25%</span>
                </div>
              </div>
            </div>

            {/* Medical Dataset Attributes */}
            <div className="bg-white rounded-lg border border-slate-200 p-5" data-testid="dataset-attributes">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="w-5 h-5 text-[#0284C7]" />
                <h3
                  className="text-base font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Medical Dataset Attributes
                </h3>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Dataset source is the University of Wisconsin Hospitals, Madison. Collected by
                Dr. William H. Wolberg containing 569 biopsy evaluations.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#475569]">Total Samples</span>
                  <span className="text-xs font-bold text-[#0F172A]">569</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#475569]">Benign Cases</span>
                  <span className="text-xs font-bold text-[#10B981]">357</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#475569]">Malignant Cases</span>
                  <span className="text-xs font-bold text-[#EF4444]">212</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#475569]">Feature Dimensions</span>
                  <span className="text-xs font-bold text-[#0F172A]">30</span>
                </div>
              </div>
            </div>

            {/* Classification Pipeline */}
            <div className="bg-[#0F172A] rounded-lg p-5" data-testid="pipeline-info">
              <div className="flex items-center space-x-2 mb-3">
                <GitBranch className="w-5 h-5 text-[#10B981]" />
                <h3
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Classification Pipeline
                </h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#0284C7] rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Feature normalization via StandardScaler
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#0284C7] rounded-full text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kernel projection to higher dimensional space
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#0284C7] rounded-full text-white text-[10px] font-bold flex items-center justify-center">3</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Optimal hyperplane calculation
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#0284C7] rounded-full text-white text-[10px] font-bold flex items-center justify-center">4</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Probability estimation via Platt scaling
                  </p>
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#0284C7] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#075985] leading-relaxed">
                  This tool assists medical professionals and does not replace clinical judgment.
                  Always consult qualified oncologists for final diagnoses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
