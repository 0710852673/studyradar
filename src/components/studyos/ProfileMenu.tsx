import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudyOS } from "@/lib/studyos/store";

export function initialsFor(name?: string | null, email?: string | null): string {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.split(/[\\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const letters = parts.length === 1 ? first.slice(0, 2) : (first[0] ?? "") + (last[0] ?? "");
  return letters.toUpperCase();
}

export function ProfileMenu() {
  const { profile, user, avatarSrc, signOut } = useStudyOS();
  const navigate = useNavigate();
  const name = profile?.name || user?.email?.split("@")[0] || "Account";
  const email = user?.email ?? profile?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Open account menu"
      >
        <Avatar className="h-9 w-9 border border-border">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {initialsFor(profile?.name, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{name}</p>
          {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            await navigate({ to: "/auth" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
