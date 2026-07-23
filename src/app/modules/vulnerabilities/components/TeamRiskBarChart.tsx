"use client";

import { useMemo, useEffect, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import type { Team } from "@/app/shared/types/vulnerabilities";
import type { Options, SeriesColumnOptions } from "highcharts";

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

const MIN_BAR_WIDTH_PX = 120;

export default function TeamRiskBarChart({ teams, config, groupBy }: TeamRiskBarChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const criticalThreshold = config?.thresholds.critical ?? 75;
  const highThreshold     = config?.thresholds.high     ?? 50;
  const mediumThreshold   = config?.thresholds.medium   ?? 25;

  const { labels, seriesData } = useMemo(() => {
    const critical:  number[] = [];
    const important: number[] = [];
    const whenTime:  number[] = [];
    const low:       number[] = [];
    const names:     string[] = [];

    if (groupBy === "team") {
      for (const team of teams) {
        const vulns = team.workloads.flatMap((w) => w.vulnerabilities);
        names.push(team.team);
        critical.push( vulns.filter((v) => v.riskScore >= criticalThreshold).length);
        important.push(vulns.filter((v) => v.riskScore >= highThreshold && v.riskScore < criticalThreshold).length);
        whenTime.push( vulns.filter((v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold).length);
        low.push(      vulns.filter((v) => v.riskScore  < mediumThreshold).length);
      }
    } else {
      // Count occurrences of each app name to detect duplicates across environments
      const appNameCount: Record<string, number> = {};
      for (const team of teams) {
        for (const workload of team.workloads) {
          appNameCount[workload.name] = (appNameCount[workload.name] ?? 0) + 1;
        }
      }

      for (const team of teams) {
        for (const workload of team.workloads) {
          const isDuplicate = (appNameCount[workload.name] ?? 0) > 1;
          const label = isDuplicate
            ? `${workload.name} (${workload.environment})`
            : workload.name;

          names.push(label);
          const vulns = workload.vulnerabilities;
          critical.push( vulns.filter((v) => v.riskScore >= criticalThreshold).length);
          important.push(vulns.filter((v) => v.riskScore >= highThreshold && v.riskScore < criticalThreshold).length);
          whenTime.push( vulns.filter((v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold).length);
          low.push(      vulns.filter((v) => v.riskScore  < mediumThreshold).length);
        }
      }
    }

    const series: SeriesColumnOptions[] = [
      { type: "column", name: "Snarest",        data: critical,  color: COLORS.critical },
      { type: "column", name: "Må prioriteres", data: important, color: COLORS.important },
      { type: "column", name: "Må planlegges",  data: whenTime,  color: COLORS.whenTime },
      { type: "column", name: "Når det passer", data: low,       color: COLORS.low },
    ];

    return { labels: names, seriesData: series };
  }, [teams, groupBy, criticalThreshold, highThreshold, mediumThreshold]);

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
    xAxis: {
      categories: labels,
      labels: {
        style: { color: textCol, fontSize: "13px" },
        rotation: labels.length > 8 ? -35 : 0,
      },
      lineColor: gridCol,
      tickColor: gridCol,
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
        borderRadius: 2,
        dataLabels: { enabled: false },
        pointWidth: 50,
      },
    },
    series: seriesData,
  };

  return (
    <div style={{ width: "100%" }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { width: "100%" } }}
      />
    </div>
  );
}
