import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { BookOpen, Search, Ruler, Circle, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const glossary = [
  { key: 'radius', label: 'Radius', clinical: 'Mean distance from the tumor center to points on its perimeter — a proxy for tumor size.', matters: 'Larger radii, especially in the "Worst" cell, are associated with malignant tumors.' },
  { key: 'texture', label: 'Texture', clinical: 'Standard deviation of gray-scale pixel intensities inside the nucleus.', matters: 'Higher texture variance suggests irregular chromatin distribution seen in cancer cells.' },
  { key: 'perimeter', label: 'Perimeter', clinical: 'Length of the nucleus boundary in pixels.', matters: 'Correlates strongly with radius; irregular perimeters raise malignancy suspicion.' },
  { key: 'area', label: 'Area', clinical: 'Number of pixels inside the nucleus boundary.', matters: 'Enlarged nuclei are a hallmark of malignancy.' },
  { key: 'smoothness', label: 'Smoothness', clinical: 'Local variation in radius lengths (how bumpy the boundary is).', matters: 'Malignant nuclei often have more variable, less smooth boundaries.' },
  { key: 'compactness', label: 'Compactness', clinical: 'Perimeter² / Area − 1.0 — how tightly the shape is packed.', matters: 'Cancer cells are typically less compact due to irregular shape.' },
  { key: 'concavity', label: 'Concavity', clinical: 'Severity of concave portions (indentations) of the contour.', matters: 'Deep concavities strongly indicate malignancy.' },
  { key: 'concave_points', label: 'Concave Points', clinical: 'Number of concave portions of the contour.', matters: 'A high count of concavities correlates with malignant classification.' },
  { key: 'symmetry', label: 'Symmetry', clinical: 'How symmetrical the nucleus is around its longest axis.', matters: 'Asymmetric nuclei are more likely to be cancerous.' },
  { key: 'fractal_dimension', label: 'Fractal Dimension', clinical: '"Coastline approximation" — measures boundary complexity.', matters: 'Higher fractal dimension = rougher boundary, common in cancer cells.' },
];

const groupInfo = [
  {
    id: 'mean',
    label: 'Mean',
    icon: Circle,
    color: '#0284C7',
    intro:
      'Average value of the feature across all cell nuclei in the biopsy sample. Establishes baseline tumor morphology.',
  },
  {
    id: 'se',
    label: 'Standard Error',
    icon: Ruler,
    color: '#F59E0B',
    intro:
      'Statistical dispersion of the feature — how much variability exists between individual nuclei. High SE suggests heterogeneous tissue, often seen in cancer.',
  },
  {
    id: 'worst',
    label: 'Worst (Largest)',
    icon: Sparkles,
    color: '#EF4444',
    intro:
      'Mean of the three largest values for the feature. Captures the most extreme (usually the most malignant-looking) nuclei in the sample — the strongest single predictor of cancer.',
  },
];

const FeatureGlossary = () => {
  const [query, setQuery] = useState('');
  const filtered = glossary.filter(
    (g) =>
      g.label.toLowerCase().includes(query.toLowerCase()) ||
      g.clinical.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-[#F0F9FF]"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
      data-testid="glossary-page"
    >
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-11 h-11 bg-[#E0F2FE] rounded-md flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#0284C7]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              data-testid="glossary-title"
            >
              Feature Glossary
            </h1>
            <p className="text-sm text-[#475569]">
              Plain-language reference for all 30 biopsy measurements used by OncoSVM AI.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a feature (e.g. concavity, area)…"
            data-testid="glossary-search"
            className="pl-9 bg-white border-slate-200 focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>

        {/* Group tabs */}
        <Tabs defaultValue="mean" className="w-full mb-6">
          <TabsList className="grid grid-cols-3 bg-white border border-slate-200 mb-4">
            {groupInfo.map((g) => (
              <TabsTrigger
                key={g.id}
                value={g.id}
                data-testid={`glossary-tab-${g.id}`}
                className="data-[state=active]:bg-[#F0F9FF] data-[state=active]:text-[#0284C7]"
              >
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {groupInfo.map((g) => {
            const GIcon = g.icon;
            return (
              <TabsContent key={g.id} value={g.id} className="space-y-4">
                {/* Group intro */}
                <div
                  className="bg-white rounded-lg border border-slate-200 p-4 flex items-start space-x-3"
                  data-testid={`glossary-group-intro-${g.id}`}
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${g.color}20` }}
                  >
                    <GIcon className="w-5 h-5" style={{ color: g.color }} />
                  </div>
                  <div>
                    <h2
                      className="text-base font-semibold text-[#0F172A]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {g.label} values
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed">{g.intro}</p>
                  </div>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.map((f) => (
                    <div
                      key={`${g.id}-${f.key}`}
                      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                      data-testid={`glossary-item-${g.id}-${f.key}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="text-sm font-semibold text-[#0F172A]"
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          {f.label}{' '}
                          {g.id === 'se' && (
                            <span className="text-[#F59E0B] text-xs">(SE)</span>
                          )}
                          {g.id === 'worst' && (
                            <span className="text-[#EF4444] text-xs">(Worst)</span>
                          )}
                        </h3>
                        <span
                          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${g.color}15`,
                            color: g.color,
                          }}
                        >
                          {g.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] leading-relaxed mb-2">
                        <span className="font-semibold text-[#475569] uppercase tracking-wider text-[10px] mr-1">
                          What it measures:
                        </span>
                        {f.clinical}
                      </p>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        <span className="font-semibold text-[#475569] uppercase tracking-wider text-[10px] mr-1">
                          Why it matters:
                        </span>
                        {f.matters}
                      </p>
                    </div>
                  ))}
                </div>

                {filtered.length === 0 && (
                  <p className="text-sm text-[#475569] italic text-center py-8">
                    No feature matches "{query}".
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Data source */}
        <div
          className="bg-[#0F172A] rounded-lg p-5 text-white"
          data-testid="data-source-card"
        >
          <h3
            className="text-base font-semibold mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Data source
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All 30 features are derived from digitized fine-needle-aspirate (FNA) images per
            the <span className="font-semibold text-white">Wisconsin Diagnostic Breast
            Cancer</span> protocol. Each of the 10 nuclear characteristics (Radius, Texture,
            Perimeter, Area, Smoothness, Compactness, Concavity, Concave Points, Symmetry,
            Fractal Dimension) is reported three times: as the sample <em>Mean</em>,
            per-cell <em>Standard Error</em>, and <em>Worst</em> (mean of three largest
            values).
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureGlossary;
