/**
 * Module navigation configuration
 * Add new modules here to have them appear in the header navigation
 */

export interface ModuleNavLink {
  /**
   * Translation key for the link text (e.g., "header.allVulnerabilities")
   */
  labelKey: string;
  
  /**
   * Path without locale prefix (e.g., "/" or "/github")
   * The locale will be automatically prepended
   */
  path: string;
  
  /**
   * Optional order for sorting (lower numbers appear first)
   * If not specified, modules appear in array order
   */
  order?: number;

  /**
   * Optional roles that can see this link
   * If not specified, link is visible to all users
   */
  allowedRoles?: string[];
}

/**
 * Registry of all module navigation links
 * To add a new module, simply add a new entry here
 */
export const moduleNavLinks: ModuleNavLink[] = [
  {
    labelKey: "header.sarbarhetsprioritering",
    path: "/prioritization",
    order: 1,
    allowedRoles: ["DEVELOPER"],
  },
  {
    labelKey: "header.etterlevelse",
    path: "/compliance",
    order: 2,
    allowedRoles: ["TEAM_MEMBER", "PRODUCT_LEADER", "TECH_LEADER"],
  },
  {
    labelKey: "header.allVulnerabilities",
    path: "/vulnerabilities",
    order: 3,
    allowedRoles: ["DEVELOPER"],
  },
  {
    labelKey: "github.tab",
    path: "/github",
    order: 4,
    allowedRoles: ["PRODUCT_LEADER", "TECH_LEADER"],
  },
  {
    labelKey: "admin.navTitle",
    path: "/admin",
    order: 5,
    allowedRoles: ["ADMIN"],
  },
];
