const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const lines = content.split('\n');

const newImports = `import { HeroPanel, PageIntro, MetricCard, Panel, ActionItem, TablePanel, EmptyState, Modal, ContactModal, LeadModal, OpportunityModal, MessageModal, ChannelModal, EntityForm, TextField, SelectField, LoadingScreen } from "../components/SharedUI";
import type { Session } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import { Calendar, Bell, CheckCircle2, CircleDollarSign, Clock3, LogOut, MessageCircle, MoveRight, Pencil, Plus, Send, Search, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, RotateCcw, Moon, Sun, X } from "lucide-react";`;

lines.splice(0, 16, newImports);

fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
