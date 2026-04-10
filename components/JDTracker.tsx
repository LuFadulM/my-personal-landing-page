'use client';

import { jds } from '@/data/jds';
import StatCard from './StatCard';

export default function JDTracker() {
  const allComplete = jds.filter((j) => j.o1 === 'Sent' && j.o2 === 'Sent' && j.intro === 'Ready').length;
  const qaComplete = jds.filter((j) => j.qa).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total JDs" value={jds.length} />
        <StatCard label="All Outreach Done" value={`${Math.round((allComplete / jds.length) * 100)}%`} color="text-healthy" />
        <StatCard label="QA Complete" value={`${Math.round((qaComplete / jds.length) * 100)}%`} color="text-healthy" />
        <StatCard label="Published" value={jds.filter((j) => j.status === 'Published').length} color="text-healthy" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Role</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Client</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Bounty</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Status</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">O1</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">O2</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Intro</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">QA</th>
              </tr>
            </thead>
            <tbody>
              {jds.map((j, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-border/20">
                  <td className="px-3 py-2.5 font-medium text-fg">{j.role}</td>
                  <td className="px-3 py-2.5 text-muted">{j.co}</td>
                  <td className="px-3 py-2.5 text-center text-muted font-mono">{j.bounty}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="bg-healthy/15 text-healthy text-[10px] px-2 py-0.5 rounded-full">{j.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="bg-healthy/15 text-healthy text-[10px] px-2 py-0.5 rounded-full">{j.o1}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="bg-healthy/15 text-healthy text-[10px] px-2 py-0.5 rounded-full">{j.o2}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="bg-healthy/15 text-healthy text-[10px] px-2 py-0.5 rounded-full">{j.intro}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {j.qa ? (
                      <span className="text-healthy">&#10003;</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
