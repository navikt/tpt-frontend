import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../../../../messages/en.json";
import nb from "../../../../../messages/nb.json";
import { DataSourceNote, type DataSourceTab } from "../DataSourceNote";

const tabs: DataSourceTab[] = ["prioritization", "vulnerabilities", "github", "compliance", "goldenpath"];

describe.each([["en", en], ["nb", nb]] as const)("data source notes in %s", (locale, messages) => {
  it("keeps the existing disclosure in compact cards without repeating the summary", async () => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DataSourceNote tab="github" compact />
      </NextIntlClientProvider>,
    );

    expect(screen.queryByText(messages.dataSource.github.summary)).not.toBeInTheDocument();
    const disclosure = screen.getByRole("button", { name: messages.dataSource.about });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(messages.dataSource.github.usage)).toBeVisible();
  });

  it.each(tabs)("keeps the %s summary visible and explains data use and limitations", async (tab) => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DataSourceNote tab={tab} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText(messages.dataSource[tab].summary)).toBeVisible();
    const disclosure = screen.getByRole("button", { name: messages.dataSource.about });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(disclosure);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      messages.dataSource.usage,
      messages.dataSource.limitations,
    ]);
    expect(screen.getByText(messages.dataSource[tab].usage)).toBeVisible();
    expect(screen.getByText(messages.dataSource[tab].limitations)).toBeVisible();
    if (tab === "compliance") {
      expect(screen.getByRole("link", { name: messages.dataSource.requirement }))
        .toHaveAttribute("href", "https://etterlevelse.ansatt.nav.no/krav/267/3");
      expect(screen.getByRole("link", { name: messages.dataSource.requirement }))
        .toHaveAttribute("target", "_blank");
    }
  });
});
