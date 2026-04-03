import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
  );
}

export default function Results() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('http://localhost:5000/api/results');
        const normalized = Array.isArray(data) ? data : data.results || [];
        setRows(normalized);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not fetch model comparison results.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const bestModelName = useMemo(() => {
    if (!rows.length) return null;
    const best = [...rows].sort((a, b) => Number(b.cv_mean) - Number(a.cv_mean))[0];
    return best?.model || best?.name || null;
  }, [rows]);

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Model Performance Comparison</h2>
        {loading && <Spinner />}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Model name</th>
              <th className="px-4 py-3 font-semibold">Accuracy</th>
              <th className="px-4 py-3 font-semibold">AUC</th>
              <th className="px-4 py-3 font-semibold">CV Mean</th>
              <th className="px-4 py-3 font-semibold">CV Std</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, idx) => {
              const modelName = row.model || row.name || `Model ${idx + 1}`;
              const isBest = bestModelName && modelName === bestModelName;
              return (
                <tr key={modelName + idx} className={isBest ? 'bg-emerald-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {modelName}
                    {isBest && (
                      <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{Number(row.accuracy).toFixed(4)}</td>
                  <td className="px-4 py-3">{Number(row.auc).toFixed(4)}</td>
                  <td className="px-4 py-3">{Number(row.cv_mean).toFixed(4)}</td>
                  <td className="px-4 py-3">{Number(row.cv_std).toFixed(4)}</td>
                </tr>
              );
            })}
            {!loading && !rows.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  No results available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
