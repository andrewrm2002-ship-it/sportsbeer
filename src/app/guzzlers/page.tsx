'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GuzzlerCard, type GuzzlerData, type GuzzlerType } from '@/components/guzzlers/GuzzlerCard';
import { cn } from '@/lib/utils';

interface ScanResult {
  totalEvents: number;
  arbsFound: number;
  nearMissesFound: number;
  valueBetsFound: number;
  mismatchesFound: number;
  leaguesScanned: number;
  errors: string[];
  requestsRemaining?: number;
}

type FilterKey = 'all' | GuzzlerType;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'arb', label: 'Arbs' },
  { key: 'value', label: 'Value Bets' },
  { key: 'mismatch', label: 'Mismatches' },
  { key: 'near_miss', label: 'Near Misses' },
];

export default function GuzzlersPage() {
  const { data: session } = useSession();
  const [guzzlers, setGuzzlers] = useState<GuzzlerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');

  const fetchGuzzlers = async () => {
    try {
      const res = await fetch('/api/guzzlers?limit=100');
      if (res.ok) setGuzzlers(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuzzlers(); }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/guzzlers/scan', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data);
        await fetchGuzzlers();
      } else {
        setScanResult({
          totalEvents: 0, arbsFound: 0, nearMissesFound: 0,
          valueBetsFound: 0, mismatchesFound: 0, leaguesScanned: 0,
          errors: [data.error],
        });
      }
    } catch {
      setScanResult({
        totalEvents: 0, arbsFound: 0, nearMissesFound: 0,
        valueBetsFound: 0, mismatchesFound: 0, leaguesScanned: 0,
        errors: ['Network error'],
      });
    } finally {
      setScanning(false);
    }
  };

  const filtered = filter === 'all'
    ? guzzlers
    : guzzlers.filter((g) => (g.type ?? (g.isArb ? 'arb' : 'near_miss')) === filter);

  const countByType = (type: GuzzlerType) =>
    guzzlers.filter((g) => (g.type ?? (g.isArb ? 'arb' : 'near_miss')) === type).length;

  const totalFound = scanResult
    ? scanResult.arbsFound + scanResult.nearMissesFound + scanResult.valueBetsFound + scanResult.mismatchesFound
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative text-center py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-accent/5 to-transparent rounded-3xl" />
        </div>
        <span className="text-5xl sm:text-6xl block mb-4">&#x1F37A;</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
          Guaranteed Guzzlers
        </h1>
        <p className="mt-2 text-sm font-medium text-accent/80 uppercase tracking-widest">
          Where the Odds Buy Your Round
        </p>
        <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Arbs, value bets, and line mismatches — scraped from 40+ sportsbooks.
          When the books disagree, you drink for free.
        </p>
      </section>

      {/* Scan controls */}
      {session && (
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl bg-bg-card border border-border">
          <div>
            <p className="text-sm font-semibold text-text-primary">Tap the Keg</p>
            <p className="text-xs text-text-muted">
              Scan {'\u2248'}20 leagues for arbs, value bets, and mismatches
            </p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200',
              scanning
                ? 'bg-accent/30 text-text-muted cursor-wait'
                : 'bg-gradient-to-r from-accent to-secondary text-bg-primary hover:shadow-lg hover:shadow-accent/25 hover:scale-105',
            )}
          >
            {scanning ? 'Scanning the taps...' : 'Pour a Fresh Scan'}
          </button>
        </div>
      )}

      {/* Scan result */}
      {scanResult && (
        <div
          className={cn(
            'p-4 rounded-xl border text-sm',
            scanResult.errors.length > 0 && totalFound === 0
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-green-500/10 border-green-500/30 text-green-400',
          )}
        >
          <p className="font-semibold">
            {totalFound > 0
              ? `Found ${totalFound} opportunities: ${scanResult.arbsFound} arb${scanResult.arbsFound !== 1 ? 's' : ''}, ${scanResult.valueBetsFound} value bet${scanResult.valueBetsFound !== 1 ? 's' : ''}, ${scanResult.mismatchesFound} mismatch${scanResult.mismatchesFound !== 1 ? 'es' : ''}`
              : scanResult.errors.length > 0
                ? 'Scan encountered errors.'
                : 'No opportunities found — lines are tight right now.'}
          </p>
          <p className="text-xs mt-1 opacity-75">
            Scanned {scanResult.leaguesScanned} leagues, {scanResult.totalEvents} events.
            {scanResult.requestsRemaining !== undefined && (
              <> API requests remaining: {scanResult.requestsRemaining}</>
            )}
          </p>
          {scanResult.errors.length > 0 && (
            <ul className="mt-2 text-xs opacity-75 list-disc list-inside">
              {scanResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'all' ? guzzlers.length : countByType(key);
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                filter === key
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted border border-transparent',
              )}
            >
              {label}
              {count > 0 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">&#x1F37B;</span>
          <p className="text-lg font-semibold text-text-secondary">
            {guzzlers.length === 0 ? 'No guzzlers on tap yet' : 'No matches for this filter'}
          </p>
          <p className="text-sm text-text-muted mt-2">
            {guzzlers.length === 0
              ? 'Hit "Pour a Fresh Scan" to check the latest odds across 20+ leagues.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((g) => <GuzzlerCard key={g.id} guzzler={g} />)}
        </div>
      )}

      {/* How it works */}
      <section className="p-6 rounded-xl bg-bg-card border border-border">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span>&#x1F4A1;</span> How Guaranteed Guzzlers Work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-text-secondary">
          <div>
            <p className="font-semibold text-green-400 mb-1">&#x1F37A; Arbs</p>
            <p>
              When implied probabilities across books sum to &lt;100%, bet both sides for
              guaranteed profit. Rare, small (1-3%), and close fast.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-400 mb-1">&#x1F37B; Value Bets</p>
            <p>
              One book&apos;s odds are significantly above the market average — a mispriced line.
              Not guaranteed, but positive expected value.
            </p>
          </div>
          <div>
            <p className="font-semibold text-orange-400 mb-1">&#x1F37E; Mismatches</p>
            <p>
              The biggest disagreements between books on the same outcome.
              When the spread is wide, someone&apos;s wrong.
            </p>
          </div>
          <div>
            <p className="font-semibold text-accent mb-1">&#x1F943; Near Misses</p>
            <p>
              Almost arbs — margin under 5%. Lines are close and could flip
              into an arb as books adjust.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
