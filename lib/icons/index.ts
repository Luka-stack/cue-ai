import {
  CalendarDays,
  Check,
  Clock,
  Plus,
  Sparkle,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';

/**
 * Wire a Lucide icon into NativeWind so `className` (e.g. `text-primary-foreground`)
 * maps onto the SVG's `color`/`opacity`. Without this, icons ignore theme classes.
 */
function iconWithClassName(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

[Plus, Sparkle, CalendarDays, Clock, X, Check].forEach(iconWithClassName);

export { CalendarDays, Check, Clock, Plus, Sparkle, X };
