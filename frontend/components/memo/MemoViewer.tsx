'use client';

import { useState } from 'react';
import { memoAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import { Memo } from '@/types';

interface MemoViewerProps {
  dealId: string;
}

export function MemoViewer({ dealId }: MemoViewerProps) {
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await memoAPI.generate(dealId);
      setMemo(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate memo');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!memo) return;
    await navigator.clipboard.writeText(memo.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!memo) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <h3 className="text-white font-medium mb-2">Decision Memo</h3>
        <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
          Generate an AI-powered decision memo summarizing all analyses and providing
          negotiation recommendations.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Memo...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Decision Memo
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Decision Memo</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="bg-zinc-800 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
        <div
          className="text-zinc-300"
          dangerouslySetInnerHTML={{
            __html: memo.content
              .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-white mt-6 mb-3">$1</h1>')
              .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold text-white mt-5 mb-2">$1</h2>')
              .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium text-white mt-4 mb-2">$1</h3>')
              .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
              .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
              .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/\n\n/g, '</p><p class="mb-3">')
          }}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleGenerate} variant="outline">
          <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
