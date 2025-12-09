'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, RefreshCw, Save } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Switch } from '@kit/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Badge } from '@kit/ui/badge';

interface ProductInfo {
  id?: string;
  website_url?: string | null;
  product_name?: string | null;
  product_description?: string | null;
  target_audience?: string | null;
  scraped_at?: string | null;
}

interface ChangelogSettings {
  id?: string;
  public_url_slug?: string | null;
  show_pr_links?: boolean;
  show_dates?: boolean;
  group_by?: string;
  auto_generate?: boolean;
  require_approval?: boolean;
}

export function ChangelogSettingsClient({
  orgId,
  orgSlug,
  initialProductInfo,
  initialSettings,
}: {
  orgId: string;
  orgSlug: string;
  initialProductInfo: ProductInfo | null;
  initialSettings: ChangelogSettings | null;
}) {
  const router = useRouter();
  const [savingProductInfo, setSavingProductInfo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [scraping, setScraping] = useState(false);

  // Product info state
  const [websiteUrl, setWebsiteUrl] = useState(initialProductInfo?.website_url || '');
  const [productName, setProductName] = useState(initialProductInfo?.product_name || '');
  const [productDescription, setProductDescription] = useState(initialProductInfo?.product_description || '');
  const [targetAudience, setTargetAudience] = useState(initialProductInfo?.target_audience || '');
  const [scrapedAt, setScrapedAt] = useState(initialProductInfo?.scraped_at || null);

  // Settings state
  const [showPrLinks, setShowPrLinks] = useState(initialSettings?.show_pr_links ?? false);
  const [showDates, setShowDates] = useState(initialSettings?.show_dates ?? true);
  const [groupBy, setGroupBy] = useState(initialSettings?.group_by || 'month');

  const handleSaveProductInfo = async () => {
    setSavingProductInfo(true);
    try {
      const res = await fetch('/api/changelog/product-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          websiteUrl: websiteUrl || null,
          productName: productName || null,
          productDescription: productDescription || null,
          targetAudience: targetAudience || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Product info saved');
      router.refresh();
    } catch (err) {
      toast.error('Failed to save product info', {
        description: (err as Error).message,
      });
    } finally {
      setSavingProductInfo(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/changelog/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          showPrLinks,
          showDates,
          groupBy,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Display settings saved');
      router.refresh();
    } catch (err) {
      toast.error('Failed to save settings', {
        description: (err as Error).message,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleScrapeWebsite = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL first');
      return;
    }

    setScraping(true);
    try {
      const res = await fetch('/api/changelog/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          url: websiteUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to scrape');
      }

      const data = await res.json();
      setScrapedAt(new Date().toISOString());
      toast.success('Website scraped successfully', {
        description: `Extracted content from: ${data.preview?.title || websiteUrl}`,
      });
      router.refresh();
    } catch (err) {
      toast.error('Failed to scrape website', {
        description: (err as Error).message,
      });
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Help the AI understand your product to generate better changelog entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="e.g., MergeMint"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                placeholder="https://your-product.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleScrapeWebsite}
                disabled={scraping || !websiteUrl}
              >
                {scraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            {scrapedAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Last scraped: {new Date(scrapedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">Product Description</Label>
            <Textarea
              id="productDescription"
              placeholder="Describe what your product does and who it's for..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Software development teams"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveProductInfo} disabled={savingProductInfo} className="w-full">
            {savingProductInfo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Product Info
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Configure how your public changelog is displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Public Changelog URL</Label>
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm">
                /changelog/{orgSlug}
              </code>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Dates</Label>
              <p className="text-sm text-muted-foreground">
                Display when each change was published
              </p>
            </div>
            <Switch
              checked={showDates}
              onCheckedChange={setShowDates}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show PR Links</Label>
              <p className="text-sm text-muted-foreground">
                Show links to the original pull requests
              </p>
            </div>
            <Switch
              checked={showPrLinks}
              onCheckedChange={setShowPrLinks}
            />
          </div>

          <div className="space-y-2">
            <Label>Group Entries By</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="version">Version</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveSettings} disabled={savingSettings} className="w-full">
            {savingSettings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Display Settings
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Quick Links</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/${orgSlug}/changelog`}>
                  Dashboard
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/changelog/${orgSlug}`} target="_blank" rel="noopener">
                  View Public Page
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
