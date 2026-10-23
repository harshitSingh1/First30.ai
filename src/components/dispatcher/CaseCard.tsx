import { DispatcherCase } from '@/types/emergency';
import PriorityBadge from './PriorityBadge';
import { Clock, MapPin } from 'lucide-react';

interface CaseCardProps {
  caseData: DispatcherCase;
  isSelected?: boolean;
  onClick?: () => void;
}

const CaseCard = ({ caseData, isSelected = false, onClick }: CaseCardProps) => {
  const getTimeAgo = (date: Date): string => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div
      onClick={onClick}
      className={`
        glass-card p-4 cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/50'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-foreground text-sm">{caseData.category}</h4>
        <PriorityBadge priority={caseData.priority} showPulse={false} />
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{caseData.summary}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(caseData.reportedAt)}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{caseData.location}</span>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
