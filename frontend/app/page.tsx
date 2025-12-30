'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dealsAPI, demoAPI } from '@/lib/api';
import { Deal } from '@/types';
import { DealCard } from '@/components/deals/DealCard';
import { DealCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Sparkles, Play, TrendingUp, Shield, FileSearch } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      const data = await dealsAPI.list();
      setDeals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadDemo() {
    setDemoLoading(true);
    try {
      const deal = await demoAPI.seed();
      router.push(`/deals/${deal.id}`);
    } catch (err: any) {
      setError(err.message);
      setDemoLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals</h1>
          <p className="text-zinc-400 mt-1">Manage your due diligence portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleLoadDemo}
            disabled={demoLoading}
            variant="outline"
            className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Try Demo
          </Button>
          <Link href="/deals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DealCardSkeleton />
          <DealCardSkeleton />
          <DealCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <Button onClick={loadDeals} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <div className="animate-fade-in">
          {/* Hero Empty State */}
          <div className="text-center py-12 mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/30 animate-pulse-subtle">
              <Sparkles className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to Deal Truth Engine</h2>
            <p className="text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
              AI-powered due diligence that surfaces hidden risks in your PE deals.
              Upload your CRM, utilisation, and AR data to get started.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleLoadDemo}
                disabled={demoLoading}
                size="lg"
                variant="outline"
                className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
              >
                {demoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Try Demo Deal
              </Button>
              <Link href="/deals/new">
                <Button size="lg" className="shadow-lg shadow-green-500/20">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Deal
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Column Mapping</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Upload any CSV or Excel file. Claude AI automatically identifies and maps columns to our schema.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">5-Dimension Stress Map</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Visualize deal health across revenue quality, utilisation, working capital, execution, and concentration.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Negotiation Leverage</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Get AI-generated recommendations for deal structuring, warranties, and earnout protections.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
