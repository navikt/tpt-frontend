"use client";

import { useState, useEffect, useRef } from "react";
import { BodyShort } from "@navikt/ds-react";
import { ChatElipsisIcon } from "@navikt/aksel-icons";

const SLACK_URL = "https://nav-it.slack.com/archives/C06P91VN27M";

export function FeedbackButton() {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
    >
      {expanded && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #C6C2BF",
            borderRadius: "12px",
            padding: "0.875rem 1rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            width: "260px",
          }}
        >
          <BodyShort size="small" style={{ marginBottom: "0.75rem" }}>
            Vi tar imot tilbakemeldinger i{" "}
            <a
              href={SLACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#005B82", fontWeight: 600 }}
            >
              #appsec
            </a>{" "}
            på Slack.
          </BodyShort>
          <a
            href={SLACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.4rem 0.875rem",
              borderRadius: "999px",
              backgroundColor: "#005B82",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            Åpne i Slack →
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label="Gi tilbakemelding"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#005B82",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
          whiteSpace: "nowrap",
          transition: "background-color 120ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004367";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#005B82";
        }}
      >
        <ChatElipsisIcon aria-hidden style={{ flexShrink: 0 }} />
        Feedback?
      </button>
    </div>
  );
}
