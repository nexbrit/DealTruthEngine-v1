'use client';

import { DealForm } from '@/components/deals/DealForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NewDealPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Deal</CardTitle>
          <CardDescription>
            Set up a new deal for due diligence analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm />
        </CardContent>
      </Card>
    </div>
  );
}
