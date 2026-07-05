const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The original multi_replace_file_content accidentally mangled the lucide-react imports. Let's fix them.
const fullImports = `import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LogOut,
  MessageCircle,
  MoveRight,
  Pencil,
  Plus,
  Send,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  RotateCcw,
  Moon,
  Sun,
  X,
} from "lucide-react";`;

content = content.replace(/import \{ HeroPanel.*?import \{\s*Calendar,\s*Bell,\s*CheckCircle2,\s*MoveRight,/s, fullImports + "\n");

// Also, the previous node script failed to execute due to unescaped string literal in bash. So we just fix it here.
fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Fixed imports');
