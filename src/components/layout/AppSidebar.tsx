import { ChevronUp, User, Wrench } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildMenuFromDTO, filterMenuByViewAccess } from "@/lib/menu";

export function AppSidebar() {
  const { state } = useSidebar();
  const { menu: apiMenu } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Build menu from API data only (auth_menu from localStorage)
  const baseMenu = apiMenu && apiMenu.length > 0 
    ? buildMenuFromDTO(apiMenu) 
    : [];

  // Filter by can_view access
  const menuItems = filterMenuByViewAccess(baseMenu);

  const isActive = (path: string) => currentPath === path;
  const hasActiveChild = (items: any[]) => 
    items?.some((item) => isActive(item.url));

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Sistema OS</span>
              <span className="text-xs text-muted-foreground">Gestão & Orçamentos</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    // Menu with submenu
                    <SidebarMenuButton
                      className={hasActiveChild(item.items) ? "bg-accent" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  ) : (
                    // Simple menu item
                     <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url || "#"} 
                        className={({ isActive }) => 
                          isActive 
                            ? "bg-primary font-medium" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                  {item.items && !collapsed && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                           <SidebarMenuSubButton asChild>
                             <NavLink 
                               to={subItem.url || "#"} 
                               className={({ isActive }) => 
                                 isActive 
                                   ? "bg-primary font-medium" 
                                   : "hover:bg-accent hover:text-accent-foreground"
                               }
                             >
                               <span>{subItem.title}</span>
                             </NavLink>
                           </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  {!collapsed && <span>Usuário</span>}
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}