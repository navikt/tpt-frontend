"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import HighchartsReact, {
  HighchartsReactRefObject,
} from "highcharts-react-official";
import Highcharts from "highcharts";
import type { Team } from "@/app/shared/types/vulnerabilities";
import type { Options, SeriesColumnOptions } from "highcharts";
import { useTranslations } from "next-intl";

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
  critical: "#c30000",
  important: "#d47b00",
  whenTime: "#0067c5",
  low: "#6f6f6f",
} as const;

const MIN_BAR_WIDTH_PX = 120;

// Track whether accessibility module has been loaded
let a11yLoaded = false;

export default function TeamRiskBarChart({
  teams,
  config,
  groupBy,
}: TeamRiskBarChartProps) {
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<HighchartsReactRefObject>(null);
  const t = useTranslations("leaderView.chart");

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
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
  const highThreshold = config?.thresholds.high ?? 50;
  const mediumThreshold = config?.thresholds.medium ?? 25;

  const rawPoints = useMemo(() => {
    const points: {
      label: string;
      critical: number;
      important: number;
      whenTime: number;
      low: number;
    }[] = [];

    if (groupBy === "team") {
      for (const team of teams) {
        const vulns = team.workloads.flatMap((w) => w.vulnerabilities);
        points.push({
          label: team.team,
          critical: vulns.filter((v) => v.riskScore >= criticalThreshold)
            .length,
          important: vulns.filter(
            (v) =>
              v.riskScore >= highThreshold && v.riskScore < criticalThreshold
          ).length,
          whenTime: vulns.filter(
            (v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold
          ).length,
          low: vulns.filter((v) => v.riskScore < mediumThreshold).length,
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
            critical: vulns.filter((v) => v.riskScore >= criticalThreshold)
              .length,
            important: vulns.filter(
              (v) =>
                v.riskScore >= highThreshold && v.riskScore < criticalThreshold
            ).length,
            whenTime: vulns.filter(
              (v) =>
                v.riskScore >= mediumThreshold && v.riskScore < highThreshold
            ).length,
            low: vulns.filter((v) => v.riskScore < mediumThreshold).length,
          });
        }
      }
    }

    return points;
  }, [teams, groupBy, criticalThreshold, highThreshold, mediumThreshold]);

  const sortedPoints = useMemo(() => {
    return [...rawPoints].sort((a, b) => {
      const total = (p: typeof a) =>
        p.critical + p.important + p.whenTime + p.low;
      return total(b) - total(a);
    });
  }, [rawPoints]);

  const { labels, seriesData } = useMemo(() => {
    const names = sortedPoints.map((p) => p.label);
    const critical = sortedPoints.map((p) => p.critical);
    const important = sortedPoints.map((p) => p.important);
    const whenTime = sortedPoints.map((p) => p.whenTime);
    const low = sortedPoints.map((p) => p.low);

    const series: SeriesColumnOptions[] = [
      { type: "column", name: t("seriesSnarest"),      data: critical,  color: COLORS.critical },
      { type: "column", name: t("seriesPrioriteres"),  data: important, color: COLORS.important },
      { type: "column", name: t("seriesPlanlegges"),   data: whenTime,  color: COLORS.whenTime },
      { type: "column", name: t("seriesNarDetPasser"), data: low,       color: COLORS.low },
    ];

    return { labels: names, seriesData: series };
  }, [sortedPoints, t]);

  const minChartWidth = labels.length * MIN_BAR_WIDTH_PX;

  const bg = isDark ? "#1a2433" : "#ffffff";
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
    title: { text: undefined },
    subtitle: { text: undefined },
    credits: { enabled: false },
    accessibility: {
      enabled: true,
      description:
        groupBy === "team"
          ? t("a11yDescriptionTeam")
          : t("a11yDescriptionApp"),
      point: {
        valueDescriptionFormat:
          "{index}. {xDescription}, {series.name}: {value}.",
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
      lineColor: gridCol,
      tickColor: gridCol,
      gridLineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: t("yAxisTitle"), style: { color: textCol } },
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
        return `<b>${this.x}</b><br/>${this.series.name}: <b>${this.y}</b><br/>${t("tooltipTotal")}: <b>${total}</b>`;
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
            return false; // disable legend filtering
          },
        },
      },
    },
    series: seriesData,
  };

  const chartKey = labels.join("|");

  return (
    <div style={{ width: "100%" }}>
      <HighchartsReact
        key={chartKey}
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={false}
        containerProps={{ style: { width: "100%" } }}
      />
    </div>
  );
}
