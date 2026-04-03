import { useState } from 'react';
import Predict from './components/Predict';
import Results from './components/Results';
import Charts from './components/Charts';

const tabs = ['Predict', 'Results', 'Charts'];

function App() {
  const [activeTab, setActiveTab] = useState('Predict');

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Heart Disease Prediction with Explainable AI
          </h1>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="animate-[fadeIn_250ms_ease-in]">
          {activeTab === 'Predict' && <Predict />}
          {activeTab === 'Results' && <Results />}
          {activeTab === 'Charts' && <Charts />}
        </section>
      </main>
    </div>
  );
}

export default App;
