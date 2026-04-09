'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jdStore, type JobDescription } from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import { Plus, FileText, Building2 } from 'lucide-react';

export default function JDsPage() {
  const [jds, setJds] = useState<JobDescription[]>([]);

  useEffect(() => {
    setJds(jdStore.list());
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Job Descriptions"
        description={`${jds.length} job description${jds.length !== 1 ? 's' : ''}`}
        action={
          <Button asChild>
            <Link href="/jds/new">
              <Plus size={14} /> New JD
            </Link>
          </Button>
        }
      />

      {jds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText size={36} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-4">No job descriptions yet.</p>
            <Button asChild>
              <Link href="/jds/new">
                <Plus size={14} /> Create your first JD
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {jds.map((jd) => (
            <Link key={jd.id} href={`/jds/${jd.id}`}>
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <FileText className="text-primary" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm">{jd.title}</h3>
                        <Badge variant="secondary">{jd.seniority}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 size={11} /> {jd.company}
                        </span>
                        <span>Updated {formatRelative(jd.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
