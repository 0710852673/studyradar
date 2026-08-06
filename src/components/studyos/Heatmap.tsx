import { format } from "date-fns";
import { heatmapDays } from "@/lib/studyos/analytics";
import type { StudySession } from "@/lib/studyos/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LEVELS = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function level(minutes: number, goal: number) {
  if (minutes <= 0) return 0;
  const ratio = minutes / Math.max(goal, 30);
  if (ratio < 0.34) return 1;
  if (ratio < 0.67) return 2;
  if (ratio < 1) return 3;
  return 4;
}

export function Heatmap({
  sessions,
  goalMinutes,
  weeks = 27,
}: {
  sessions: StudySession[];
  goalMinutes: number;
  weeks?: number;
}) {
  const days = heatmapDays(sessions, weeks);
  const columns: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  return (
    <TooltipProvider delayDuration={80}>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {columns.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((d) => (
                <Tooltip key={d.key}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-3 w-3 rounded-[3px] transition-transform hover:scale-125 ${LEVELS[level(d.minutes, goalMinutes)]}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {Math.round((d.minutes / 60) * 10) / 10}h · {format(d.date, "d MMM yyyy")}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        Less
        {LEVELS.map((c, i) => (
          <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />
        ))}
        More
      </div>
    </TooltipProvider>
  );
}
