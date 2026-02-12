// Category → Lucide icon mapping (presentation layer, not domain)
import type { WordCategory } from '../../domain/entities';
import {
  User,
  PersonStanding,
  HandHelping,
  HelpCircle,
  Heart,
  Tags,
  Hash,
  Palette,
  Clock,
  Accessibility,
  Home,
  GraduationCap,
  UtensilsCrossed,
  Shirt,
  Car,
  TreePine,
  MapPin,
  PawPrint,
  Package,
  Speech,
  Sparkles,
  Search,
  Loader,
  ArrowLeft,
  X,
  Plus,
  Undo2,
  Trash2,
  Volume2,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CATEGORY_ICONS: Record<WordCategory, LucideIcon> = {
  pronouns: User,
  verbs: PersonStanding,
  social: HandHelping,
  questions: HelpCircle,
  emotions: Heart,
  adjectives: Tags,
  numbers: Hash,
  colors: Palette,
  time: Clock,
  body: Accessibility,
  home: Home,
  school: GraduationCap,
  food: UtensilsCrossed,
  clothing: Shirt,
  vehicles: Car,
  nature: TreePine,
  places: MapPin,
  animals: PawPrint,
  nouns: Package,
};

export const FALLBACK_ICON = Speech;

// Re-export commonly used icons for other UI elements
export {
  Sparkles,
  Search,
  Loader,
  ArrowLeft,
  X,
  Plus,
  Undo2,
  Trash2,
  Volume2,
  Settings,
  Speech,
};
