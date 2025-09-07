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

// Default menu structure when no menu is provided by API
export const defaultMenu: MenuItemDTO[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: "Home",
    permission: "dashboard.view"
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: "Users",
    permission: "clients.view"
  },
  {
    title: "Objetos de Serviço",
    url: "/service-objects",
    icon: "Wrench",
    permission: "service-objects.view"
  },
  {
    title: "Catálogo",
    icon: "Package",
    permission: "catalog.view",
    items: [
      {
        title: "Produtos",
        url: "/products",
        permission: "catalog.products.view"
      },
      {
        title: "Serviços",
        url: "/services",
        permission: "catalog.services.view"
      },
      {
        title: "Categorias",
        url: "/categories",
        permission: "catalog.categories.view"
      }
    ]
  },
  {
    title: "Orçamentos",
    url: "/budgets",
    icon: "FileText",
    permission: "budgets.view"
  },
  {
    title: "Ordens de Serviço",
    url: "/service-orders",
    icon: "ClipboardList",
    permission: "service-orders.view"
  },
  {
    title: "Financeiro",
    icon: "DollarSign",
    permission: "finance.view",
    items: [
      {
        title: "Pagamentos",
        url: "/finance/payments",
        permission: "finance.payments.view"
      },
      {
        title: "Fluxo de Caixa",
        url: "/finance/cash-flow",
        permission: "finance.cash-flow.view"
      },
      {
        title: "Contas a Receber",
        url: "/finance/accounts-receivable",
        permission: "finance.accounts-receivable.view"
      },
      {
        title: "Contas a Pagar",
        url: "/finance/accounts-payable",
        permission: "finance.accounts-payable.view"
      }
    ]
  },
  {
    title: "Relatórios",
    icon: "BarChart3",
    permission: "reports.view",
    items: [
      {
        title: "Receita",
        url: "/reports/revenue",
        permission: "reports.revenue.view"
      },
      {
        title: "Ordens de Serviço",
        url: "/reports/service-orders",
        permission: "reports.service-orders.view"
      },
      {
        title: "Top Produtos",
        url: "/reports/top-products",
        permission: "reports.top-products.view"
      },
      {
        title: "Financeiro",
        url: "/reports/financial",
        permission: "reports.financial.view"
      }
    ]
  },
  {
    title: "Configurações",
    icon: "Settings",
    permission: "settings.view",
    items: [
      {
        title: "Usuários",
        url: "/settings/users",
        permission: "settings.users.view"
      },
      {
        title: "Perfis de Usuário",
        url: "/settings/user-profiles",
        permission: "settings.user-profiles.view"
      },
      {
        title: "Permissões",
        url: "/settings/permissions",
        permission: "settings.permissions.view"
      },
      {
        title: "Status de OS",
        url: "/settings/os-statuses",
        permission: "settings.os-statuses.view"
      },
      {
        title: "Métodos de Pagamento",
        url: "/settings/payment-methods",
        permission: "settings.payment-methods.view"
      },
      {
        title: "Sistema",
        url: "/settings/system",
        permission: "settings.system.view"
      }
    ]
  }
];

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