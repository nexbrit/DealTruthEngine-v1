'use client';

import { useState } from 'react';
import { memoAPI, demoAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, Copy, Check, Printer, Download, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { Memo } from '@/types';

interface MemoViewerProps {
  dealId: string;
  isDemo?: boolean;
}

export function MemoViewer({ dealId, isDemo = false }: MemoViewerProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const result = await memoAPI.generate(dealId);
      setProgress(100);
      setTimeout(() => {
        setMemo(result);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to generate memo');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Fast progress for demo
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 25, 90));
    }, 200);

    try {
      const result = await demoAPI.getMemoContent();
      setProgress(100);
      setTimeout(() => {
        setMemo({
          deal_id: dealId,
          content: result.content,
          generated_at: new Date().toISOString(),
        });
      }, 300);
    } catch (err: any) {
      // Fallback to regular generation if demo content unavailable
      await handleGenerate();
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!memo) return;
    await navigator.clipboard.writeText(memo.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!memo) return;
    const blob = new Blob([memo.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-memo-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (content: string) => {
    // Better markdown rendering
    let html = content
      // Tables (simple)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => /^[-:]+$/.test(c.trim()))) {
          return ''; // Skip separator row
        }
        const isHeader = content.indexOf(match) < content.indexOf('|---|');
        const cellTag = isHeader ? 'th' : 'td';
        const cellClass = isHeader
          ? 'px-3 py-2 text-left text-sm font-semibold text-white bg-zinc-800'
          : 'px-3 py-2 text-sm text-zinc-300 border-t border-zinc-800';
        return `<tr>${cells.map(c => `<${cellTag} class="${cellClass}">${c.trim()}</${cellTag}>`).join('')}</tr>`;
      })
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-zinc-700">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-white mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-white mt-5 mb-2">$1</h3>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white font-bold italic">$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-zinc-300 italic">$1</em>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1 flex items-start gap-2"><span class="text-green-500 mt-1.5">•</span><span>$1</span></li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 flex items-start gap-2"><span class="text-green-500 mt-1.5">•</span><span>$1</span></li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-2 text-zinc-300"><span class="text-green-500 font-semibold mr-2">$&</span></li>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-green-400 text-sm">$1</code>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="border-zinc-700 my-6" />')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4 text-zinc-300 leading-relaxed">');

    // Wrap in paragraph tags
    html = '<p class="mb-4 text-zinc-300 leading-relaxed">' + html + '</p>';

    // Wrap tables
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="w-full my-4 border border-zinc-800 rounded-lg overflow-hidden">$&</table>');

    return html;
  };

  if (!memo) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <FileText className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Decision Memo</h3>
        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          Generate an AI-powered decision memo summarizing all analyses,
          highlighting key risks, and providing negotiation recommendations.
        </p>

        {loading && (
          <div className="max-w-xs mx-auto mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-zinc-500 text-xs mt-2">
              {progress < 30 ? 'Analyzing deal data...' :
               progress < 60 ? 'Synthesizing findings...' :
               progress < 90 ? 'Generating recommendations...' :
               'Finalizing memo...'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {isDemo && (
            <Button
              onClick={handleQuickDemo}
              disabled={loading}
              size="lg"
              variant="outline"
              className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              Quick Demo
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="shadow-lg shadow-green-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>

        {isDemo && (
          <p className="text-zinc-600 text-xs mt-4">
            Quick Demo loads pre-generated content instantly. Generate with AI uses Claude in real-time.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Decision Memo
            {isDemo && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
                Demo
              </span>
            )}
          </h3>
          <p className="text-zinc-500 text-sm">
            Generated {new Date(memo.generated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 no-print"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Memo Content */}
      <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-xl p-8 border border-zinc-800 print:bg-white print:text-black print:border-none">
        <div
          className="prose prose-invert max-w-none print:prose-neutral"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(memo.content) }}
        />
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-zinc-600 text-xs">
          This memo was generated by AI and should be reviewed by investment professionals.
        </p>
        <Button
          onClick={isDemo ? handleQuickDemo : handleGenerate}
          variant="ghost"
          size="sm"
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
