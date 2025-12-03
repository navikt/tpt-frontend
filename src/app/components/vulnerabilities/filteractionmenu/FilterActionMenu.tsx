"use client";
import { ActionMenu, Button } from "@navikt/ds-react";
import { ChevronDownIcon } from "@navikt/aksel-icons";

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
          <ActionMenu.Group label={filterName}>
            {filterOptions.map((option, i) => (
              <ActionMenu.CheckboxItem
                key={option + i}
                checked={selectedFilters?.[option] || false}
                onCheckedChange={() => handleCheckboxChange(option)}
              >
                {option}
              </ActionMenu.CheckboxItem>
            ))}
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>
    </div>
  );
};

export default FilterActionMenu;
