import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RoleContextProvider,
  useRoleContext,
} from "@/app/shared/contexts/RoleContext";
import { AppHeader } from "../AppHeader";

const { getKvItemMock, setKvItemMock, removeKvItemMock, useVulnerabilitiesContextMock, pushMock } = vi.hoisted(() => ({
  getKvItemMock: vi.fn(),
  setKvItemMock: vi.fn(),
  removeKvItemMock: vi.fn(),
  useVulnerabilitiesContextMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/app/shared/utils/indexedDbCache", () => ({
  getKvItem: getKvItemMock,
  setKvItem: setKvItemMock,
  removeKvItem: removeKvItemMock,
  KV_KEYS: { ROLE_CONTEXT: "role-context" },
}));

vi.mock("@/app/contexts/VulnerabilitiesContext", () => ({
  useVulnerabilitiesContext: useVulnerabilitiesContextMock,
}));

vi.mock("@/app/shared/hooks/useUser", () => ({
  useUser: () => ({ user: { email: "test@example.com" }, isLoading: false }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    key === "roleContext.viewingAs" ? `Viewing as: ${params?.role}` : key,
  useLocale: () => "en",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/prioritization",
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../WorkContextFilter", () => ({ default: () => null }));
vi.mock("../LanguageSwitcher", () => ({ default: () => null }));
vi.mock("../ThemeToggle", () => ({ ThemeToggle: () => null }));

function RoleState() {
  const { actualRole, effectiveRole } = useRoleContext();
  return <output aria-label="role">{JSON.stringify({ actualRole, effectiveRole })}</output>;
}

function renderHeader() {
  return render(
    <RoleContextProvider>
      <AppHeader />
      <RoleState />
    </RoleContextProvider>,
  );
}

describe("role-based navigation and admin access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getKvItemMock.mockResolvedValue("LEADER");
    useVulnerabilitiesContextMock.mockReturnValue({
      data: { userRole: "ADMIN", teams: [] },
      isLoading: false,
      teamFilters: [],
      applicationFilters: [],
    });
  });

  it.each([
    ["LEADER", false, false],
    ["TEAM_MEMBER", true, false],
    ["DEVELOPER", true, true],
  ])("filters admin navigation by the selected %s role", async (role, vulnerabilities, goldenPath) => {
    getKvItemMock.mockResolvedValue(role);
    renderHeader();

    await screen.findByRole("link", { name: "header.etterlevelse" });

    expect(!!screen.queryByRole("link", { name: "header.vulnerabilities" })).toBe(vulnerabilities);
    expect(!!screen.queryByRole("link", { name: "header.goldenPath" })).toBe(goldenPath);
    expect(!!screen.queryByRole("tab", { name: "github.tab" })).toBe(vulnerabilities);
    expect(screen.getByLabelText("role")).toHaveTextContent(
      JSON.stringify({ effectiveRole: role }),
    );

    await userEvent.click(screen.getByRole("button", { name: "settings.title" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "admin.navTitle" }));
    expect(pushMock).toHaveBeenCalledWith("/en/admin");
  });

  it("does not use the backend admin value as a display role", async () => {
    getKvItemMock.mockResolvedValue(undefined);
    renderHeader();

    await waitFor(() => expect(getKvItemMock).toHaveBeenCalled());

    expect(screen.getByLabelText("role")).toHaveTextContent("{}");
    expect(screen.queryByRole("link", { name: "header.etterlevelse" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "header.vulnerabilities" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "header.goldenPath" })).not.toBeInTheDocument();
  });

  it("shows the current role in a no-redirect landing link without clearing the stored choice", async () => {
    useVulnerabilitiesContextMock.mockReturnValue({
      data: { userRole: "DEVELOPER", teams: [] },
      isLoading: false,
      teamFilters: { "my-team": true },
      applicationFilters: { "my-app": true },
    });
    renderHeader();

    const link = await screen.findByRole("link", { name: "Viewing as: roleContext.LEADER" });
    expect(link).toHaveAttribute("href", "/en?welcome=true&team=my-team&app=my-app");
    expect(screen.getByLabelText("role")).toHaveTextContent(
      JSON.stringify({ actualRole: "DEVELOPER", effectiveRole: "LEADER" }),
    );
    expect(setKvItemMock).not.toHaveBeenCalled();
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });

  it("keeps the landing entry visible before a display role is selected", async () => {
    getKvItemMock.mockResolvedValue(null);
    renderHeader();

    expect(screen.getByRole("link", { name: "roleContext.chooseRole" }))
      .toHaveAttribute("href", "/en?welcome=true");
    await waitFor(() => expect(getKvItemMock).toHaveBeenCalled());
  });

  it("does not grant admin access through a selected role", async () => {
    useVulnerabilitiesContextMock.mockReturnValue({
      data: { userRole: "TEAM_MEMBER", teams: [] },
      isLoading: false,
      teamFilters: [],
      applicationFilters: [],
    });
    renderHeader();

    await waitFor(() => expect(screen.getByLabelText("role")).toHaveTextContent(
      JSON.stringify({ actualRole: "TEAM_MEMBER", effectiveRole: "LEADER" }),
    ));
    await userEvent.click(screen.getByRole("button", { name: "settings.title" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "admin.navTitle" })).not.toBeInTheDocument();
  });
});
