import Criticals from "./components/criticals/Criticals";
import Link from "next/link";
import { BodyShort } from "@navikt/ds-react";

export default function Home() {
  return (
    <div style={{ marginTop: "2rem" }}>
      <main>
        <div>
          <h1>
            Sårbarhetsprioritering som gir <i>mening</i>
          </h1>
          <BodyShort spacing>
            Titt på ting er et prioriteringsverktøy ment for å filtrere bort
            støy og usikkerhet.
          </BodyShort>
          <BodyShort spacing>
            Ikke alle sårbarheter er født like og vi har gjort jobben for med
            deg å analysere og rangere de mest kritiske sårbarhetene i teamene
            du tilhører. Sårbarhetslisten hentes fra SBOM som ligger hos nais
            Console.
          </BodyShort>
          <BodyShort>
            For en komplett oversikt over alle tilgjengelige sårbarheter, se{" "}
            <Link href="/vulnerabilities">sårbarhetssiden.</Link>
          </BodyShort>
        </div>
        <Criticals />
      </main>
    </div>
  );
}
