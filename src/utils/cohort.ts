export interface CohortTarget {
  stream: string;
  branch: string;
  year: string;
  section: string;
  isRestricted: boolean;
}

export function parseCohortTarget(description?: string | null): CohortTarget {
  if (!description) {
    return { stream: 'All', branch: 'All', year: 'All', section: 'All', isRestricted: false };
  }
  const match = description.match(/\[TARGET:([^\]]+)\]/i);
  if (!match) {
    return { stream: 'All', branch: 'All', year: 'All', section: 'All', isRestricted: false };
  }

  const raw = match[1];
  const parts: Record<string, string> = raw.split(';').reduce((acc: any, item: string) => {
    const [k, v] = item.split('=');
    if (k && v) acc[k.trim().toLowerCase()] = v.trim();
    return acc;
  }, {});

  const stream = parts['stream'] || 'All';
  const branch = parts['branch'] || 'All';
  const year = parts['year'] || 'All';
  const section = parts['section'] || 'All';

  const isRestricted = stream !== 'All' || branch !== 'All' || year !== 'All' || section !== 'All';

  return { stream, branch, year, section, isRestricted };
}

export function checkStudentAccess(description?: string | null, studentProfile?: any): { allowed: boolean; target: CohortTarget } {
  const target = parseCohortTarget(description);
  if (!target.isRestricted) {
    return { allowed: true, target };
  }

  const stStream = (studentProfile?.stream || studentProfile?.user_metadata?.stream || 'B.Tech').toLowerCase();
  const stBranch = (studentProfile?.branch || studentProfile?.user_metadata?.branch || 'CSE').toLowerCase();
  const stYear = (studentProfile?.year || studentProfile?.user_metadata?.year || '3rd Year').toLowerCase();
  const stSection = (studentProfile?.section || studentProfile?.user_metadata?.section || 'A').toLowerCase();

  const isStreamMatch = target.stream.toLowerCase() === 'all' || target.stream.toLowerCase() === stStream;
  const isBranchMatch = target.branch.toLowerCase() === 'all' || target.branch.toLowerCase() === stBranch;
  const isYearMatch = target.year.toLowerCase() === 'all' || target.year.toLowerCase() === stYear;
  const isSectionMatch = target.section.toLowerCase() === 'all' || target.section.toLowerCase() === stSection;

  const allowed = isStreamMatch && isBranchMatch && isYearMatch && isSectionMatch;

  return { allowed, target };
}

