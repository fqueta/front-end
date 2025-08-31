import {
  Home,
  Users,
  Wrench,
  Package,
  FileText,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react";
import { MenuItemDTO, MenuItemResolved } from "@/types/menu";

// Icon map for resolving string icon names to components
export const iconMap: Record<string, LucideIcon> = {
  Home,
  Users,
  Wrench,
  Package,
  FileText,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
};

// Helper to check if can_view is truthy (considers 1, '1', true as truthy)
export function isCanViewTruthy(canView?: boolean | number | '0' | '1'): boolean {
  if (canView === undefined || canView === null) return false;
  if (typeof canView === 'boolean') return canView;
  if (typeof canView === 'number') return canView === 1;
  if (typeof canView === 'string') return canView === '1';
  return false;
}

// Resolve menu DTOs to menu items with actual icon components
export function buildMenuFromDTO(menuDTO: MenuItemDTO[]): MenuItemResolved[] {
  return menuDTO.map((item) => ({
    ...item,
    id: item.id,
    parent_id: item.parent_id,
    icon: iconMap[item.icon || ""] || FileText, // fallback to FileText
    can_view: item.can_view,
    items: item.items ? buildMenuFromDTO(item.items) : undefined,
  }));
}

// Find menu item by URL path
export function findMenuItemByUrl(menu: MenuItemDTO[], url: string): MenuItemDTO | undefined {
  for (const item of menu) {
    if (item.url === url) {
      return item;
    }
    if (item.items) {
      const found = findMenuItemByUrl(item.items, url);
      if (found) return found;
    }
  }
  return undefined;
}

// Filter menu based on can_view access (can_view undefined = invisible by default)
export function filterMenuByViewAccess(menu: MenuItemResolved[]): MenuItemResolved[] {
  return menu
    .map((item) => {
      // If item has subitems, filter them recursively first
      let filteredItems: MenuItemResolved[] | undefined;
      if (item.items) {
        filteredItems = filterMenuByViewAccess(item.items);
      }

      // Item is visible if:
      // 1. Its can_view is truthy OR
      // 2. It has visible children (even if its own can_view is falsy/undefined)
      const hasVisibleChildren = filteredItems && filteredItems.length > 0;
      const isItemVisible = isCanViewTruthy(item.can_view) || hasVisibleChildren;

      if (!isItemVisible) {
        return null;
      }

      return {
        ...item,
        items: filteredItems,
      };
    })
    .filter((item) => item !== null) as MenuItemResolved[];
}