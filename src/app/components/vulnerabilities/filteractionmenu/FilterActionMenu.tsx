"use client";
import { ActionMenu, Button, TextField, BodyShort } from "@navikt/ds-react";
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

const MAX_ITEMS_WITHOUT_SEARCH = 20;
const MAX_ITEMS_WITH_SEARCH = 50;

const FilterActionMenu = ({
  filterName,
  filterOptions,
  selectedFilters,
  setFilter,
  style,
}: FilterActionMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("filter");

  const { filteredOptions, displayOptions, isLimited } = useMemo(() => {
    let filtered = filterOptions;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filterOptions.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Determine limit based on whether user is searching
    const limit = searchQuery ? MAX_ITEMS_WITH_SEARCH : MAX_ITEMS_WITHOUT_SEARCH;
    const limited = filtered.length > limit;
    const display = limited ? filtered.slice(0, limit) : filtered;

    return {
      filteredOptions: filtered,
      displayOptions: display,
      isLimited: limited,
    };
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
            {displayOptions.length > 0 ? (
              <>
                {displayOptions.map((option, i) => (
                  <ActionMenu.CheckboxItem
                    key={option + i}
                    checked={selectedFilters?.[option] || false}
                    onCheckedChange={() => handleCheckboxChange(option)}
                  >
                    {option}
                  </ActionMenu.CheckboxItem>
                ))}
                {isLimited && (
                  <div style={{ padding: "0.5rem", borderTop: "1px solid #e0e0e0" }}>
                    <BodyShort size="small" style={{ color: "#888", fontStyle: "italic" }}>
                      {t("showingLimited", {
                        showing: displayOptions.length,
                        total: filteredOptions.length,
                      })}
                    </BodyShort>
                  </div>
                )}
              </>
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
