"use client";
import { Box, Loader } from "@navikt/ds-react";

export default function Loading() {
  return (
    <Box
      paddingBlock="space-24"
      style={{ display: "flex", justifyContent: "center", minHeight: "50vh", alignItems: "center" }}
    >
      <Loader size="large" title="Laster..." />
    </Box>
  );
}
