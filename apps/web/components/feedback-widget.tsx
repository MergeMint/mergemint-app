'use client';

import { useState } from 'react';

import { Bug, Lightbulb, MessageSquarePlus, X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

const GITHUB_REPO = 'MergeMint/mergemint-app';

const feedbackOptions = [
  {
    id: 'bug',
    label: 'Report a Bug',
    description: 'Found something broken? Let us know',
    icon: Bug,
    url: `https://github.com/${GITHUB_REPO}/issues/new?template=bug_report.md&labels=bug`,
    color: 'text-red-500',
  },
  {
    id: 'feature',
    label: 'Request a Feature',
    description: 'Have an idea? We\'d love to hear it',
    icon: Lightbulb,
    url: `https://github.com/${GITHUB_REPO}/issues/new?template=feature_request.md&labels=enhancement`,
    color: 'text-yellow-500',
  },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Options Panel */}
      <div
        className={cn(
          'absolute right-0 bottom-14 mb-2 w-72 origin-bottom-right transition-all duration-200',
          isOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <div className="bg-card rounded-lg border shadow-lg">
          <div className="border-b p-3">
            <h3 className="text-sm font-semibold">Send Feedback</h3>
            <p className="text-muted-foreground text-xs">
              Help us improve MergeMint
            </p>
          </div>
          <div className="p-2">
            {feedbackOptions.map((option) => (
              <a
                key={option.id}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-muted flex items-start gap-3 rounded-md p-3 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <option.icon className={cn('mt-0.5 h-5 w-5', option.color)} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-muted-foreground text-xs">
                    {option.description}
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="border-t p-2">
            <a
              href={`https://github.com/${GITHUB_REPO}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground block text-center text-xs transition-colors"
            >
              View all issues on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        size="icon"
        variant={isOpen ? 'secondary' : 'default'}
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close feedback menu' : 'Open feedback menu'}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquarePlus className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
