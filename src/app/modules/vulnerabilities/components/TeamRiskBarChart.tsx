"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import HighchartsReact, { HighchartsReactRefObject } from "highcharts-react-official";
import Highcharts from "highcharts";
import type { Team } from "@/app/shared/types/vulnerabilities";
import type { Options, SeriesColumnOptions } from "highcharts";
import { Button, HStack, BodyShort } from "@navikt/ds-react";
import { ArrowDownIcon, ArrowUpIcon } from "@navikt/aksel-icons";

interface ThresholdConfig {
  thresholds: {
    critical: number;
    high: number;
    medium: number;
  };
}

interface TeamRiskBarChartProps {
  teams: Team[];
  config: ThresholdConfig | null;
  groupBy: "team" | "app";
}

const COLORS = {
  critical:  "#c30000",
  important: "#d47b00",
  whenTime:  "#0067c5",
  low:       "#6f6f6f",
} as const;

const SERIES_NAMES = ["Snarest", "Må prioriteres", "Må planlegges", "Når det passer"] as const;
type SeriesName = typeof SERIES_NAMES[number];
type SortOrder = "desc" | "asc";

const MIN_BAR_WIDTH_PX = 120;

// Track whether accessibility module has been loaded
let a11yLoaded = false;

export default function TeamRiskBarChart({ teams, config, groupBy }: TeamRiskBarChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [hiddenSeries, setHiddenSeries] = useState<Set<SeriesName>>(new Set());
  const chartRef = useRef<HighchartsReactRefObject>(null);
  // Keep a stable ref so the callback can always read current hiddenSeries
  const hiddenSeriesRef = useRef<Set<SeriesName>>(hiddenSeries);

  useEffect(() => {
    hiddenSeriesRef.current = hiddenSeries;
  }, [hiddenSeries]);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (a11yLoaded) return;
    a11yLoaded = true;
    import("highcharts/modules/accessibility").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const init = (mod as any).default ?? mod;
      if (typeof init === "function") init(Highcharts);
    });
  }, []);

  const criticalThreshold = config?.thresholds.critical ?? 75;
  const highThreshold     = config?.thresholds.high     ?? 50;
  const mediumThreshold   = config?.thresholds.medium   ?? 25;

  const rawPoints = useMemo(() => {
    const points: { label: string; critical: number; important: number; whenTime: number; low: number }[] = [];

    if (groupBy === "team") {
      for (const team of teams) {
        const vulns = team.workloads.flatMap((w) => w.vulnerabilities);
        points.push({
          label:     team.team,
          critical:  vulns.filter((v) => v.riskScore >= criticalThreshold).length,
          important: vulns.filter((v) => v.riskScore >= highThreshold && v.riskScore < criticalThreshold).length,
          whenTime:  vulns.filter((v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold).length,
          low:       vulns.filter((v) => v.riskScore  < mediumThreshold).length,
        });
      }
    } else {
      const appNameCount: Record<string, number> = {};
      for (const team of teams)
        for (const workload of team.workloads)
          appNameCount[workload.name] = (appNameCount[workload.name] ?? 0) + 1;

      for (const team of teams) {
        if (team.workloads.length === 0) continue;
        for (const workload of team.workloads) {
          const isDuplicate = (appNameCount[workload.name] ?? 0) > 1;
          const label = isDuplicate
            ? `${workload.name} (${workload.environment})`
            : workload.name;
          const vulns = workload.vulnerabilities;
          points.push({
            label,
            critical:  vulns.filter((v) => v.riskScore >= criticalThreshold).length,
            important: vulns.filter((v) => v.riskScore >= highThreshold && v.riskScore < criticalThreshold).length,
            whenTime:  vulns.filter((v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold).length,
            low:       vulns.filter((v) => v.riskScore  < mediumThreshold).length,
          });
        }
      }
    }

    return points;
  }, [teams, groupBy, criticalThreshold, highThreshold, mediumThreshold]);

  const sortedPoints = useMemo(() => {
    return [...rawPoints].sort((a, b) => {
      const visibleTotal = (p: typeof a) =>
        (!hiddenSeries.has("Snarest")        ? p.critical  : 0) +
        (!hiddenSeries.has("Må prioriteres") ? p.important : 0) +
        (!hiddenSeries.has("Må planlegges")  ? p.whenTime  : 0) +
        (!hiddenSeries.has("Når det passer") ? p.low       : 0);

      const diff = visibleTotal(b) - visibleTotal(a);
      return sortOrder === "desc" ? diff : -diff;
    });
  }, [rawPoints, sortOrder, hiddenSeries]);

  const { labels, seriesData } = useMemo(() => {
    const names     = sortedPoints.map((p) => p.label);
    const critical  = sortedPoints.map((p) => p.critical);
    const important = sortedPoints.map((p) => p.important);
    const whenTime  = sortedPoints.map((p) => p.whenTime);
    const low       = sortedPoints.map((p) => p.low);

    const series: SeriesColumnOptions[] = [
      { type: "column", name: "Snarest",        data: critical,  color: COLORS.critical },
      { type: "column", name: "Må prioriteres", data: important, color: COLORS.important },
      { type: "column", name: "Må planlegges",  data: whenTime,  color: COLORS.whenTime },
      { type: "column", name: "Når det passer", data: low,       color: COLORS.low },
    ];

    return { labels: names, seriesData: series };
  }, [sortedPoints]);

  // Callback runs once after Highcharts creates a fresh chart instance.
  // Restores hidden series from ref (stable, no stale closure).
  const handleCallback = useCallback((chart: Highcharts.Chart) => {
    const hidden = hiddenSeriesRef.current;
    if (hidden.size === 0) return;
    chart.series.forEach((s) => {
      if (hidden.has(s.name as SeriesName)) {
        s.setVisible(false, false);
      }
    });
    chart.redraw(false);
  }, []);

  const cycleSort = () => {
    setSortOrder((prev) => prev === "desc" ? "asc" : "desc");
  };

  const minChartWidth = labels.length * MIN_BAR_WIDTH_PX;

  const bg      = isDark ? "#1a2433" : "#ffffff";
  const textCol = isDark ? "#e0e0e0" : "#1a1a1a";
  const gridCol = isDark ? "#2e3d52" : "#e8e8e8";

  const options: Options = {
    chart: {
      type: "column",
      backgroundColor: bg,
      height: 420,
      scrollablePlotArea: {
        minWidth: minChartWidth,
        scrollPositionX: 0,
      },
      style: { fontFamily: "inherit" },
      animation: { duration: 300 },
    },
    title:    { text: undefined },
    subtitle: { text: undefined },
    credits:  { enabled: false },
    accessibility: {
      enabled: true,
      description: groupBy === "team"
        ? "Stablet søylediagram som viser antall sårbarheter per team, fordelt på prioriteringskategorier."
        : "Stablet søylediagram som viser antall sårbarheter per applikasjon, fordelt på prioriteringskategorier.",
      point: {
        valueDescriptionFormat: "{index}. {xDescription}, {series.name}: {value}.",
      },
      series: {
        descriptionFormat: "{seriesDescription}.",
      },
      keyboardNavigation: {
        enabled: true,
      },
    },
    xAxis: {
      categories: labels,
      labels: {
        style: { color: textCol, fontSize: "13px" },
        rotation: labels.length > 8 ? -35 : 0,
      },
      lineColor:     gridCol,
      tickColor:     gridCol,
      gridLineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: "Antall sårbarheter", style: { color: textCol } },
      stackLabels: {
        enabled: true,
        style: { color: textCol, fontWeight: "600", fontSize: "12px" },
        formatter() {
          return this.total > 0 ? String(this.total) : "";
        },
      },
      gridLineColor: gridCol,
      labels: { style: { color: textCol } },
    },
    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "top",
      layout: "vertical",
      itemStyle: { color: textCol, fontWeight: "normal", fontSize: "13px" },
      itemHoverStyle: { color: isDark ? "#ffffff" : "#000000" },
    },
    tooltip: {
      shared: false,
      backgroundColor: isDark ? "#243447" : "#ffffff",
      borderColor: gridCol,
      style: { color: textCol },
      formatter() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = this as any;
        const total: number = ctx.point?.stackTotal ?? ctx.total ?? 0;
        return `<b>${this.x}</b><br/>${this.series.name}: <b>${this.y}</b><br/>Totalt: <b>${total}</b>`;
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        borderRadius: 0,
        dataLabels: { enabled: false },
        pointWidth: 50,
      },
      series: {
        events: {
          legendItemClick() {
            const name = this.name as SeriesName;
            // Toggle visibility directly on the series instance — safe, no chart.update()
            this.setVisible(!this.visible, true);
            // Sync React state for sort calculation
            setHiddenSeries((prev) => {
              const next = new Set(prev);
              if (next.has(name)) next.delete(name);
              else next.add(name);
              return next;
            });
            return false; // prevent Highcharts default handler
          },
        },
      },
    },
    series: seriesData,
  };

  const SortIcon = sortOrder === "desc" ? ArrowDownIcon : ArrowUpIcon;

  // Key drives full remount when labels change (sort/filter).
  // allowChartUpdate=false ensures chart.update() is never called — only fresh mounts.
  const chartKey = labels.join("|");

  return (
    <div style={{ width: "100%" }}>
      <HStack justify="end" align="center" gap="space-8" style={{ marginBottom: "0.5rem" }}>
        <BodyShort size="small" style={{ color: textCol }}>Sorter:</BodyShort>
        <Button
          variant="tertiary"
          size="small"
          onClick={cycleSort}
        >
          {sortOrder === "desc" ? "Høy" : "Lav"}
          <SortIcon aria-hidden style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }} />
          {sortOrder === "desc" ? "Lav" : "Høy"}
        </Button>
      </HStack>
      <HighchartsReact
        key={chartKey}
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={false}
        callback={handleCallback}
        containerProps={{ style: { width: "100%" } }}
      />
    </div>
  );
}
