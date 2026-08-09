/** Ítem de menú de WordPress expuesto en /headless/v1/site → menus.primary */
export interface MenuItem {
  id: number;
  label: string;
  url: string;
  parentId: number;
  order: number;
  target?: string;
}
