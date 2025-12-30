'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dealsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function DealForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    target_company: '',
    target_revenue: '',
    currency: 'GBP',
    stage: 'in_sight',
    thesis_summary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        target_revenue: formData.target_revenue ? parseFloat(formData.target_revenue) : null,
      };

      const deal = await dealsAPI.create(data);
      router.push(`/deals/${deal.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Deal Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., CloudOps Ltd Acquisition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Target Company *
          </label>
          <Input
            value={formData.target_company}
            onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
            placeholder="e.g., CloudOps Ltd"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Target Revenue
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={formData.target_revenue}
              onChange={(e) => setFormData({ ...formData, target_revenue: e.target.value })}
              placeholder="45000000"
              className="flex-1"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Deal Stage
          </label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="in_sight">In Sight</option>
            <option value="diligence">Diligence</option>
            <option value="stabilise">Stabilise</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">
          Investment Thesis
        </label>
        <Textarea
          value={formData.thesis_summary}
          onChange={(e) => setFormData({ ...formData, thesis_summary: e.target.value })}
          placeholder="Describe the investment thesis and key value drivers..."
          rows={4}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Deal'
          )}
        </Button>
      </div>
    </form>
  );
}
