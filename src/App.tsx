import { useEffect, useState } from 'react';
import type { Campaign } from './types';
import { loadCampaigns, saveCampaigns } from './storage';
import { CampaignListPage } from './components/CampaignListPage';
import { CampaignForm } from './components/CampaignForm';
import { CampaignDetail } from './components/CampaignDetail';
import './App.css';

type View =
  | { name: 'list' }
  | { name: 'create' }
  | { name: 'edit'; id: string }
  | { name: 'detail'; id: string };

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadCampaigns());
  const [view, setView] = useState<View>({ name: 'list' });

  useEffect(() => {
    saveCampaigns(campaigns);
  }, [campaigns]);

  const addCampaign = (c: Campaign) => {
    setCampaigns((prev) => [c, ...prev]);
    setView({ name: 'detail', id: c.id });
  };

  const updateCampaign = (c: Campaign) => {
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setView({ name: 'detail', id: c.id });
  };

  // Update in place without changing the current view (used by "Get Data").
  const patchCampaign = (c: Campaign) => {
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const selected =
    view.name === 'detail' || view.name === 'edit'
      ? campaigns.find((c) => c.id === view.id)
      : undefined;

  return (
    <div className="app">
      <header className="app__bar">
        <h2
          className="app__brand"
          onClick={() => setView({ name: 'list' })}
          style={{ cursor: 'pointer' }}
        >
          Campaign Monitoring
        </h2>
        <span className="app__sub">YouTube Ads · Performance</span>
      </header>

      <main className="app__main">
        {view.name === 'list' && (
          <CampaignListPage
            campaigns={campaigns}
            onOpen={(id) => setView({ name: 'detail', id })}
            onCreate={() => setView({ name: 'create' })}
            onEdit={(id) => setView({ name: 'edit', id })}
            onDelete={deleteCampaign}
          />
        )}

        {view.name === 'create' && (
          <CampaignForm
            onSave={addCampaign}
            onCancel={() => setView({ name: 'list' })}
          />
        )}

        {view.name === 'edit' &&
          (selected ? (
            <CampaignForm
              initial={selected}
              onSave={updateCampaign}
              onCancel={() => setView({ name: 'detail', id: selected.id })}
            />
          ) : (
            <CampaignListPage
              campaigns={campaigns}
              onOpen={(id) => setView({ name: 'detail', id })}
              onCreate={() => setView({ name: 'create' })}
              onEdit={(id) => setView({ name: 'edit', id })}
              onDelete={deleteCampaign}
            />
          ))}

        {view.name === 'detail' &&
          (selected ? (
            <CampaignDetail
              campaign={selected}
              onBack={() => setView({ name: 'list' })}
              onEdit={() => setView({ name: 'edit', id: selected.id })}
              onUpdate={patchCampaign}
            />
          ) : (
            <CampaignListPage
              campaigns={campaigns}
              onOpen={(id) => setView({ name: 'detail', id })}
              onCreate={() => setView({ name: 'create' })}
              onEdit={(id) => setView({ name: 'edit', id })}
              onDelete={deleteCampaign}
            />
          ))}
      </main>
    </div>
  );
}

export default App;
