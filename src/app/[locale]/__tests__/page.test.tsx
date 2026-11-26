import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/en.json";
import nbMessages from "../../../../messages/nb.json";
import { RoleContextProvider, useRoleContext } from "@/app/shared/contexts/RoleContext";
import Home from "../page";

const { getKvItemMock, setKvItemMock, removeKvItemMock, replaceMock, state } = vi.hoisted(() => ({
  getKvItemMock: vi.fn(),
  setKvItemMock: vi.fn(),
  removeKvItemMock: vi.fn(),
  replaceMock: vi.fn(),
  state: { query: "", userRole: "LEADER" },
}));

vi.mock("@/app/shared/utils/indexedDbCache", () => ({
  getKvItem: getKvItemMock,
  setKvItem: setKvItemMock,
  removeKvItem: removeKvItemMock,
  KV_KEYS: { ROLE_CONTEXT: "role-context" },
}));

vi.mock("@/app/contexts/VulnerabilitiesContext", () => ({
  useVulnerabilitiesContext: () => ({
    data: { userRole: state.userRole, teams: [] },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(state.query),
}));

function StoredRole() {
  const { selectedRole } = useRoleContext();
  return <output aria-label="stored role">{selectedRole ?? ""}</output>;
}

function renderHome(locale: "en" | "nb" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? messages : nbMessages}>
      <RoleContextProvider>
        <Home />
        <StoredRole />
      </RoleContextProvider>
    </NextIntlClientProvider>,
  );
}

describe("landing explanations and role selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getKvItemMock.mockResolvedValue(null);
    state.query = "";
    state.userRole = "LEADER";
  });

  it("shows explanations before the role picker for a first-time visitor", async () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1, name: "Titt på ting" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "What the data is for" })).toBeVisible();
    expect(screen.getByRole("group", { name: "2. Choose your view" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Where the data comes from" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "How we find your teams" })).not.toBeInTheDocument();
    expect(screen.getByText(messages.welcome.subheading)).toBeVisible();
    expect(screen.getByRole("button", { name: messages.welcome.selectPrompt })).toBeDisabled();
    await waitFor(() => expect(getKvItemMock).toHaveBeenCalled());
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it.each([
    ["en", messages, ["No Risk Score", "Full Risk Score", "Reduced Risk Score"]],
    ["nb", nbMessages, ["Ingen risikoscore", "Full risikoscore", "Redusert risikoscore"]],
  ] as const)("shows task questions and visible interpretation limits in %s", (locale, translations, oldLabels) => {
    renderHome(locale);

    for (const tab of ["compliance", "prioritization", "github"] as const) {
      const card = screen.getByRole("region", { name: translations.dataSource[tab].title, exact: true });
      const copy = translations.welcome.explanation.cards[tab];
      expect(within(card).getByText(copy.question)).toBeVisible();
      const limitations = within(card).getByText(`${translations.dataSource.limitations}:`, { selector: "strong" }).parentElement;
      expect(limitations).toBeVisible();
      expect(limitations).toHaveTextContent(copy.limitations);
    }

    for (const label of oldLabels) {
      expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
    }
  });

  it.each(["DEVELOPER", "TEAM_MEMBER", "LEADER", "NONE", "ADMIN"] as const)(
    "keeps the stored view independent of the backend %s role",
    async (role) => {
      state.userRole = role;
      state.query = "welcome=true";
      getKvItemMock.mockResolvedValue("TEAM_LEADER");
      renderHome();

      await waitFor(() => expect(screen.getByLabelText("stored role")).toHaveTextContent("TEAM_LEADER"));
      expect(screen.getByRole("button", { name: /^Team Leader/ })).toHaveAttribute("aria-pressed", "true");
      if (role === "DEVELOPER" || role === "TEAM_MEMBER" || role === "LEADER") {
        const suggestedView = screen.getByRole("button", {
          name: new RegExp(`^${messages.welcome.roles[role].title}`),
        });
        expect(within(suggestedView).getByText(messages.welcome.suggested)).toBeVisible();
        expect(suggestedView).toHaveAttribute("aria-pressed", "false");
      } else {
        expect(screen.queryByText(messages.welcome.suggested)).not.toBeInTheDocument();
      }
      expect(replaceMock).not.toHaveBeenCalled();
      expect(setKvItemMock).not.toHaveBeenCalled();
    },
  );

  it.each(["DEVELOPER", "TEAM_MEMBER", "LEADER"] as const)(
    "suggests the backend %s view without selecting or storing it",
    (role) => {
      state.userRole = role;
      renderHome();

      const suggestedView = screen.getByRole("button", {
        name: new RegExp(`^${messages.welcome.roles[role].title}`),
      });
      expect(within(suggestedView).getByText(messages.welcome.suggested)).toBeVisible();
      expect(screen.getAllByText(messages.welcome.suggested)).toHaveLength(1);
      expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
      expect(screen.getByRole("button", { name: messages.welcome.selectPrompt })).toBeDisabled();
      expect(setKvItemMock).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
    },
  );

  it("shows the suggested view in Norwegian without selecting it", () => {
    state.userRole = "DEVELOPER";
    renderHome("nb");

    const developer = screen.getByRole("button", { name: /^Utvikler/ });
    expect(within(developer).getByText(nbMessages.welcome.suggested)).toBeVisible();
    expect(developer).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: nbMessages.welcome.selectPrompt })).toBeDisabled();
    expect(setKvItemMock).not.toHaveBeenCalled();
  });

  it.each([["en", messages], ["nb", nbMessages]] as const)(
    "explains the team lookup order without a local filter in %s",
    (locale, translations) => {
      state.userRole = "NONE";
      renderHome(locale);

      const teams = screen.getByRole("region", { name: translations.welcome.teams.title });
      const list = within(teams).getByRole("list");
      expect(list.tagName).toBe("OL");
      expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
        translations.welcome.teams.steps.nais,
        translations.welcome.teams.steps.teamkatalogen,
        translations.welcome.teams.steps.leadership,
      ]);
      expect(within(teams).queryByRole("button")).not.toBeInTheDocument();
      expect(within(teams).getByText(translations.welcome.teams.missing)).toBeVisible();
      expect(within(teams).getByText(translations.welcome.teams.relevance)).toBeVisible();
    },
  );

  it.each([
    ["Developer", "Developer"],
    ["Team Member", "Team Member"],
    ["Team Leader", "Team Leader"],
    ["Other leaders", "Other leaders"],
  ])("enables Continue as %s only after selecting that view", async (buttonName, roleName) => {
    renderHome();
    expect(screen.getByRole("button", { name: "Select a view to continue" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: new RegExp(`^${buttonName}`) }));

    expect(screen.getByRole("button", { name: `Continue as ${roleName}`, exact: true })).toBeEnabled();
    expect(setKvItemMock).not.toHaveBeenCalled();
  });

  it("supports keyboard selection and announces only the selected view", async () => {
    renderHome();
    const developer = screen.getByRole("button", { name: /^Developer/ });
    const leader = screen.getByRole("button", { name: /^Team Leader/ });

    developer.focus();
    await userEvent.keyboard("{Enter}");
    expect(developer).toHaveAttribute("aria-pressed", "true");

    leader.focus();
    await userEvent.keyboard(" ");
    expect(leader).toHaveAttribute("aria-pressed", "true");
    expect(developer).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Continue as Team Leader" })).toBeEnabled();
    expect(setKvItemMock).not.toHaveBeenCalled();
  });

  it.each([
    ["Developer", "DEVELOPER", "prioritization"],
    ["Team Member", "TEAM_MEMBER", "compliance"],
    ["Team Leader", "TEAM_LEADER", "compliance"],
    ["Other leaders", "LEADER", "compliance"],
  ])("continues immediately when %s is double-clicked", async (name, role, tab) => {
    state.query = "welcome=true&team=my-team&app=my-app";
    renderHome();

    await userEvent.dblClick(screen.getByRole("button", { name: new RegExp(`^${name}`) }));

    expect(setKvItemMock).toHaveBeenCalledWith("role-context", role);
    expect(setKvItemMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith(`/en/${tab}?team=my-team&app=my-app`);
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });

  it("continues on double-click without rewriting the stored view", async () => {
    getKvItemMock.mockResolvedValue("LEADER");
    state.query = "welcome=true";
    renderHome();
    await waitFor(() => expect(screen.getByLabelText("stored role")).toHaveTextContent("LEADER"));

    await userEvent.dblClick(screen.getByRole("button", { name: /^Other leaders/ }));

    expect(replaceMock).toHaveBeenCalledWith("/en/compliance");
    expect(setKvItemMock).not.toHaveBeenCalled();
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });

  it.each([
    ["DEVELOPER", "prioritization"],
    ["TEAM_MEMBER", "compliance"],
    ["TEAM_LEADER", "compliance"],
    ["LEADER", "compliance"],
  ])("still redirects a returning %s visitor to %s", async (role, tab) => {
    getKvItemMock.mockResolvedValue(role);
    state.query = "team=my-team";
    renderHome();

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(`/en/${tab}?team=my-team`));
    expect(setKvItemMock).not.toHaveBeenCalled();
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });

  it("reopens with the stored role selected and confirms it without clearing or rewriting it", async () => {
    getKvItemMock.mockResolvedValue("LEADER");
    state.query = "welcome=true&team=my-team&app=my-app";
    renderHome();

    await waitFor(() => expect(screen.getByRole("button", { name: /^Other leaders/ })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByRole("heading", { name: "Titt på ting" })).toBeVisible();
    expect(screen.getByLabelText("stored role")).toHaveTextContent("LEADER");
    expect(replaceMock).not.toHaveBeenCalled();
    expect(setKvItemMock).not.toHaveBeenCalled();
    expect(removeKvItemMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Continue as Other leaders" }));

    expect(replaceMock).toHaveBeenCalledWith("/en/compliance?team=my-team&app=my-app");
    expect(setKvItemMock).not.toHaveBeenCalled();
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });

  it("only stores a new role when the user confirms the choice", async () => {
    getKvItemMock.mockResolvedValue("LEADER");
    state.query = "welcome=true";
    renderHome();
    await waitFor(() => expect(screen.getByLabelText("stored role")).toHaveTextContent("LEADER"));

    await userEvent.click(screen.getByRole("button", { name: /^Developer/ }));
    expect(screen.getByLabelText("stored role")).toHaveTextContent("LEADER");
    expect(setKvItemMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Continue as Developer" }));

    expect(setKvItemMock).toHaveBeenCalledWith("role-context", "DEVELOPER");
    expect(replaceMock).toHaveBeenCalledWith("/en/prioritization");
    expect(removeKvItemMock).not.toHaveBeenCalled();
  });
});
