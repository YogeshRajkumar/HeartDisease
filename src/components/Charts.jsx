import { useState } from 'react';
import axios from 'axios';

const chartActions = [
  { key: 'roc', label: 'ROC Curve', endpoint: '/api/chart/roc' },
  { key: 'confusion', label: 'Confusion Matrix', endpoint: '/api/chart/confusion' },
  { key: 'shap_bar', label: 'SHAP Feature Importance', endpoint: '/api/chart/shap_bar' },
  { key: 'shap_summary', label: 'SHAP Summary', endpoint: '/api/chart/shap_summary' },
];

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
  );
}

export default function Charts() {
  const [selected, setSelected] = useState('');
  const [imgData, setImgData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchChart = async (action) => {
    setLoading(true);
    setError('');
    setSelected(action.label);

    try {
      const { data } = await axios.get(`http://localhost:5000${action.endpoint}`);
      const image = data.image || data.base64 || data.data || data;
      const encoded = String(image).startsWith('data:image') ? image : `data:image/png;base64,${image}`;
      setImgData(encoded);
    } catch (err) {
      setError(err?.response?.data?.message || `Could not load ${action.label}.`);
      setImgData('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Model Visualizations</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {chartActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => fetchChart(action)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Chart Preview</h3>
          {loading && <Spinner />}
        </div>

        {selected && <p className="mb-3 text-sm text-slate-500">Selected: {selected}</p>}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
          {imgData ? (
            <img
              src={imgData}
              alt={selected || 'Model chart'}
              className="max-h-[480px] w-full rounded-lg object-contain"
            />
          ) : (
            <p className="text-sm text-slate-500">Choose a chart button to load and preview visualization.</p>
          )}
        </div>
      </div>
    </div>
  );
}
