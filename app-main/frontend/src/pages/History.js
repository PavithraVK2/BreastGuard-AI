import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Activity, Loader2, Search, Trash2, Download, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'}/api`;

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem("session_token");

const response = await axios.get(`${API}/predictions`, {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      setPredictions(response.data);
    } catch (error) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

const handleDelete = async (predictionId) => {

    console.log("DELETE ID FROM FRONTEND:", predictionId);

    try {
      const token = localStorage.getItem("session_token");

      await axios.delete(
        `${API}/predictions/${predictionId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Record deleted");
      setPredictions(prev =>
        prev.filter(p => p.prediction_id !== predictionId)
      );
      fetchPredictions();

    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem("session_token");

      await axios.delete(`${API}/predictions/clear`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('All records cleared');
      setPredictions([]);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to clear records");
    }
  };

  const handleExportCSV = () => {
    if (predictions.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = [
      'Patient Case ID',
      'Biopsy Mean Radius (mm)',
      'Biopsy Mean Texture (units)',
      'Biopsy Mean Perimeter (mm)',
      'Biopsy Mean Area (sq_mm)',
      'Diagnostic Decision',
      'AI Confidence Margin (%)',
      'Diagnostic Date',
    ];
    const rows = filteredPredictions.map((p) => [
      p.patient_name,
      p.features[0]?.toFixed(2),
      p.features[1]?.toFixed(2),
      p.features[2]?.toFixed(2),
      p.features[3]?.toFixed(1),
      p.result,
      (p.confidence * 100).toFixed(1),
      new Date(p.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oncosvm_records_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.result.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'benign' && p.result === 'Benign') ||
      (filter === 'malignant' && p.result === 'Malignant');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F0F9FF]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              data-testid="history-title"
            >
              Diagnostic Database Logs
            </h1>
            <p className="text-sm text-[#475569]">
              Archived patient SVM evaluations under HIPAA compliance guidelines
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center space-x-1.5 px-3 py-2 border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] rounded-md text-sm font-medium transition-colors duration-200"
                  data-testid="clear-all-button"
                  disabled={predictions.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Logs</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    <span>Confirm Deletion</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your diagnostic records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="cancel-clear-button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-[#EF4444] hover:bg-[#DC2626]"
                    data-testid="confirm-clear-button"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 rounded-md text-sm font-medium transition-colors duration-200"
              data-testid="export-csv-button"
            >
              <Download className="w-4 h-4 text-[#10B981]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          {/* Search and Filter row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
            <div className="relative w-full md:flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search patient ID or classification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-[#0284C7] border-slate-200 bg-slate-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-xs uppercase tracking-wider text-[#475569] font-medium">
                Classification Filter:
              </label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48 border-slate-200" data-testid="classification-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show All Diagnostics</SelectItem>
                  <SelectItem value="benign">Benign Only</SelectItem>
                  <SelectItem value="malignant">Malignant Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0284C7]" />
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-12" data-testid="no-predictions-message">
              <Activity className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
              <p className="text-[#475569] mb-4">
                {searchTerm || filter !== 'all'
                  ? 'No records match your filters'
                  : 'No diagnostic records yet'}
              </p>
              {!searchTerm && filter === 'all' && (
                <Link
                  to="/prediction"
                  className="inline-block px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm rounded-md transition-colors duration-200"
                >
                  Run First Diagnosis
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="predictions-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Patient Case ID</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Biopsy Mean Radius</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Biopsy Mean Texture</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Biopsy Mean Perimeter</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Biopsy Mean Area</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Diagnostic Decision</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">AI Confidence Margin</th>
                    <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((p) => (
                    <tr
                      key={p.prediction_id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                      data-testid={`history-row-${p.prediction_id}`}
                    >
                      <td className="py-4 px-3 font-bold text-[#0F172A]">{p.patient_name}</td>
                      <td className="py-4 px-3 text-[#475569]">{p.features[0]?.toFixed(2)} mm</td>
                      <td className="py-4 px-3 text-[#475569]">{p.features[1]?.toFixed(2)} units</td>
                      <td className="py-4 px-3 text-[#475569]">{p.features[2]?.toFixed(2)} mm</td>
                      <td className="py-4 px-3 text-[#475569]">{p.features[3]?.toFixed(1)} sq_mm</td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            p.result === 'Benign'
                              ? 'bg-[#D1FAE5] text-[#059669] border border-[#10B981]'
                              : 'bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]'
                          }`}
                        >
                          {p.result}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-bold text-[#0F172A]">{(p.confidence * 100).toFixed(1)}%</td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleDelete(p.prediction_id)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors duration-200"
                          data-testid={`delete-record-${p.prediction_id}`}
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
