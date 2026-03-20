import React from 'react';
import { ShieldAlert, Shield, ShieldCheck, CheckCircle2, User } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  isOfficial?: boolean;
}

export default function RoleBadge({ role, isOfficial }: RoleBadgeProps) {
  if (role === 'owner') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
        <ShieldAlert className="w-3 h-3" />
        OWNER
      </span>
    );
  }
  
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
        <Shield className="w-3 h-3" />
        ADMIN
      </span>
    );
  }
  
  if (role === 'moderator') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <ShieldCheck className="w-3 h-3" />
        MODERATOR
      </span>
    );
  }

  if (role === 'verified' || isOfficial) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
        <CheckCircle2 className="w-3 h-3" />
        VERIFIED
      </span>
    );
  }

  return null;
}
