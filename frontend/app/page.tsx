'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dealsAPI } from '@/lib/api';
import { Deal } from '@/types';
import { DealCard } from '@/components/deals/DealCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FolderOpen } from 'lucide-react';

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals</h1>
          <p className="text-zinc-400 mt-1">Manage your due diligence portfolio</p>
        </div>
        <Link href="/deals/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <Button onClick={loadDeals} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
          <h2 className="text-xl font-medium text-white mb-2">No deals yet</h2>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">
            Create your first deal to start uploading evidence and running AI-powered analysis.
          </p>
          <Link href="/deals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Deal
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
