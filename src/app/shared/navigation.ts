/**
 * Module navigation configuration — two-level structure.
 *
 * Top-level sections appear in the primary (dark) header row.
 * Each section may have sub-links that appear in the secondary nav row.
 * Sections and sub-links with allowedRoles are filtered by the user's effective role.
 * ADMIN bypasses all allowedRoles checks.
 */

export interface SubNavLink {
  labelKey: string;
  path: string;
  order?: number;
  allowedRoles?: string[];
}

export interface NavSection {
  /** Translation key for the section label shown in the top row */
  labelKey: string;
  /**
   * The canonical path for this section — used for active-state detection.
   * If the section has sub-links, this is the path of the first sub-link.
   */
  path: string;
  order?: number;
  allowedRoles?: string[];
  subLinks?: SubNavLink[];
}

/**
 * Top-level navigation sections.
 * Sections with a single sub-link (or no sub-links) hide the second row.
 * Admin section is collapsed into the avatar menu and excluded from this list.
 */
export const navSections: NavSection[] = [
  {
    labelKey: "header.vulnerabilities",
    path: "/prioritization",
    order: 1,
    allowedRoles: ["DEVELOPER", "TEAM_MEMBER"],
    subLinks: [
      {
        labelKey: "header.sarbarhetsprioritering",
        path: "/prioritization",
        order: 1,
        allowedRoles: ["DEVELOPER", "TEAM_MEMBER"],
      },
      {
        labelKey: "header.allVulnerabilities",
        path: "/vulnerabilities",
        order: 2,
        allowedRoles: ["DEVELOPER", "TEAM_MEMBER"],
      },
      {
        labelKey: "github.tab",
        path: "/github",
        order: 3,
        allowedRoles: ["DEVELOPER", "TEAM_MEMBER"],
      },
    ],
  },
  {
    labelKey: "header.etterlevelse",
    path: "/compliance",
    order: 2,
    allowedRoles: ["DEVELOPER", "TEAM_MEMBER", "LEADER", "TEAM_LEADER"],
  },
  {
    labelKey: "header.goldenPath",
    path: "/goldenpath",
    order: 3,
    allowedRoles: ["ADMIN"],
  },
];

/**
 * Admin section — rendered inside the avatar menu, not in the top nav.
 */
export const adminNavLink: SubNavLink = {
  labelKey: "admin.navTitle",
  path: "/admin",
  allowedRoles: ["ADMIN"],
};

/**
 * Legacy flat list — kept for any consumers that relied on moduleNavLinks.
 * Derived from navSections so there is a single source of truth.
 */
export const moduleNavLinks = navSections.flatMap((section) =>
  section.subLinks && section.subLinks.length > 0
    ? section.subLinks
    : [{ labelKey: section.labelKey, path: section.path, order: section.order, allowedRoles: section.allowedRoles }]
);
