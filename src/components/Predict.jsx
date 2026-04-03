import { useMemo, useState } from 'react';
import axios from 'axios';

const defaultForm = {
  age: 54,
  sex: 1,
  cp: 0,
  trestbps: 130,
  chol: 250,
  fbs: 0,
  restecg: 1,
  thalach: 150,
  exang: 0,
  oldpeak: 1.2,
  slope: 1,
  ca: 0,
  thal: 2,
};

const fields = [
  { key: 'age', label: 'Age', type: 'number', step: 1 },
  { key: 'sex', label: 'Sex (0=female, 1=male)', type: 'number', step: 1, min: 0, max: 1 },
  { key: 'cp', label: 'Chest Pain Type (0–3)', type: 'number', step: 1, min: 0, max: 3 },
  { key: 'trestbps', label: 'Resting Blood Pressure', type: 'number', step: 1 },
  { key: 'chol', label: 'Cholesterol', type: 'number', step: 1 },
  { key: 'fbs', label: 'Fasting Blood Sugar (0/1)', type: 'number', step: 1, min: 0, max: 1 },
  { key: 'restecg', label: 'Resting ECG (0–2)', type: 'number', step: 1, min: 0, max: 2 },
  { key: 'thalach', label: 'Max Heart Rate', type: 'number', step: 1 },
  { key: 'exang', label: 'Exercise Angina (0/1)', type: 'number', step: 1, min: 0, max: 1 },
  { key: 'oldpeak', label: 'Oldpeak', type: 'number', step: 0.1 },
  { key: 'slope', label: 'Slope (0–2)', type: 'number', step: 1, min: 0, max: 2 },
  { key: 'ca', label: 'CA (0–3)', type: 'number', step: 1, min: 0, max: 3 },
  { key: 'thal', label: 'Thal (0–3)', type: 'number', step: 1, min: 0, max: 3 },
];

const parseShapData = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw.shap_values && typeof raw.shap_values === 'object') {
    return Object.entries(raw.shap_values).map(([feature, value]) => ({ feature, value }));
  }
  if (raw.feature_contributions && typeof raw.feature_contributions === 'object') {
    return Object.entries(raw.feature_contributions).map(([feature, value]) => ({ feature, value }));
  }
  return [];
};

function Spinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
  );
}

function ShapBarChart({ data = [] }) {
  const top = useMemo(() => {
    return [...data]
      .map((item) => ({ ...item, value: Number(item.value) || 0 }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 8);
  }, [data]);

  if (!top.length) {
    return <p className="text-sm text-slate-500">No SHAP explanation available from the API response.</p>;
  }

  const maxAbs = Math.max(...top.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="space-y-3">
      {top.map((item) => {
        const width = (Math.abs(item.value) / maxAbs) * 100;
        const positive = item.value >= 0;
        return (
          <div key={item.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-700">{item.feature}</span>
              <span>{item.value.toFixed(3)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  positive ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500">Red bars increase risk, blue bars decrease risk.</p>
    </div>
  );
}

export default function Predict() {
  const [formData, setFormData] = useState(defaultForm);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value === '' ? '' : Number(value),
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      const label = data.prediction_label ?? (Number(data.prediction) === 1 ? 'Heart Disease' : 'No Disease');
      const probabilityValue =
        data.probability_percent ?? (data.probability != null ? Number(data.probability) * 100 : null);

      setPrediction({
        label,
        probability: probabilityValue,
        shap: parseShapData(data.shap || data.explanation || data),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Prediction request failed. Please verify backend API status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Patient Features</h2>
        <p className="mb-4 text-sm text-slate-500">Enter the 13 clinical values and run prediction.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
              <input
                type={field.type}
                min={field.min}
                max={field.max}
                step={field.step}
                value={formData[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePredict}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Spinner />}
            Predict
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {prediction && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Prediction Result</h3>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Prediction</p>
            <p
              className={`text-2xl font-bold ${
                prediction.label === 'Heart Disease' ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {prediction.label}
            </p>
            {prediction.probability != null && (
              <p className="mt-1 text-sm text-slate-600">Probability: {Number(prediction.probability).toFixed(2)}%</p>
            )}
          </div>

          <div className="mt-5">
            <h4 className="mb-3 text-base font-semibold text-slate-800">SHAP Explanation (Top Features)</h4>
            <ShapBarChart data={prediction.shap} />
          </div>
        </div>
      )}
    </div>
  );
}
