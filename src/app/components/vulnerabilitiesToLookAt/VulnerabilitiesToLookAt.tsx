"use client";
import {useVulnerabilities} from "../../hooks/useVulnerabilities";
import {useConfig} from "../../hooks/useConfig";
import VulnerableList from "@/app/components/vulnerabilitiesToLookAt/VulnreabilitiesList";
import {Accordion} from "@navikt/ds-react";



const VulnerabilitiesToLookAt = () => {
    const {data, isLoading} = useVulnerabilities();
    const {config, isLoading: configLoading} = useConfig();

    const asapThreshold = config?.thresholds.asap ?? 100;
    const whenTimeThreshold = config?.thresholds.whenTime ?? 50;
    const ifBoredThreshold = config?.thresholds.ifBored ?? 25;

    return (
        <Accordion>
            <VulnerableList
                isLoading={isLoading || configLoading}
                isOpen={true}
                data={data}
                vulnerabilitiesName="superkritiske"
                maxThreshold={Number.MAX_VALUE}
                minThreshold={asapThreshold}
            />
            <VulnerableList
                isLoading={isLoading || configLoading}
                isOpen={false}
                data={data}
                vulnerabilitiesName="lurt å ta unna"
                maxThreshold={asapThreshold}
                minThreshold={whenTimeThreshold}
            />
            <VulnerableList
                isLoading={isLoading || configLoading}
                isOpen={false}
                data={data}
                vulnerabilitiesName="når du har tid"
                maxThreshold={whenTimeThreshold}
                minThreshold={ifBoredThreshold}
            />
        </Accordion>
    );
};

export default VulnerabilitiesToLookAt;
