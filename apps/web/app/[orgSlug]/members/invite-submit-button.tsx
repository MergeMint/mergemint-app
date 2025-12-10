'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@kit/ui/button';
import { Loader2 } from 'lucide-react';

export function InviteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Sending...' : 'Send Invitation'}
    </Button>
  );
}
