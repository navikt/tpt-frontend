"use client";
import { ActionMenu, Button, TextField } from "@navikt/ds-react";
import { ChevronDownIcon } from "@navikt/aksel-icons";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type FilterActionMenuProps = {
  filterName: string;
  filterOptions: string[];
  selectedFilters?: Record<string, boolean>;
  setFilter: (filters: Record<string, boolean>) => void;
  style?: React.CSSProperties;
};

const FilterActionMenu = ({
  filterName,
  filterOptions,
  selectedFilters,
  setFilter,
  style,
}: FilterActionMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("filter");

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return filterOptions;
    return filterOptions.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filterOptions, searchQuery]);

  const handleCheckboxChange = (option: string) => {
    const isSelected = selectedFilters?.[option] || false;

    if (selectedFilters) {
      setFilter({
        ...selectedFilters,
        [option]: !isSelected,
      });
    }
  };

  return (
    <div style={style}>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button
            variant="secondary-neutral"
            icon={<ChevronDownIcon aria-hidden />}
          >
            {filterName}
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <div style={{ padding: "0.5rem", borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              label=""
              hideLabel
              size="small"
              placeholder={t("searchPlaceholder", { filterName: filterName.toLowerCase() })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ActionMenu.Group label={filterName}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, i) => (
                <ActionMenu.CheckboxItem
                  key={option + i}
                  checked={selectedFilters?.[option] || false}
                  onCheckedChange={() => handleCheckboxChange(option)}
                >
                  {option}
                </ActionMenu.CheckboxItem>
              ))
            ) : (
              <div style={{ padding: "0.5rem", color: "#888" }}>
                {t("noResults")}
              </div>
            )}
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>
    </div>
  );
};

export default FilterActionMenu;
