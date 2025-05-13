// components/icons.tsx
import {
  LayoutDashboard,
  Users,
  Plus,
  Edit3,
  Trash2,
  Printer,
  Eye,
  Search,
  ChevronDown,
  X,
  LucideProps,
} from 'lucide-react';

export const Icons = {
  Dashboard: (props: LucideProps) => <LayoutDashboard {...props} />,
  Students: (props: LucideProps) => <Users {...props} />,
  Add: (props: LucideProps) => <Plus {...props} />,
  Edit: (props: LucideProps) => <Edit3 {...props} />,
  Delete: (props: LucideProps) => <Trash2 {...props} />,
  Print: (props: LucideProps) => <Printer {...props} />,
  View: (props: LucideProps) => <Eye {...props} />,
  Search: (props: LucideProps) => <Search {...props} />,
  ChevronDown: (props: LucideProps) => <ChevronDown {...props} />,
  Close: (props: LucideProps) => <X {...props} />,
};