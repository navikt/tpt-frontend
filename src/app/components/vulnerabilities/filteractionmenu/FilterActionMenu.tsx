"use client";
import { ActionMenu, Button } from "@navikt/ds-react";
import { ChevronDownIcon } from "@navikt/aksel-icons";

type FilterActionMenuProps = {
  filterName: string;
  filterOptions: string[];
  selectedFilters?: string[];
  setFilter: (filters: string[]) => void;
};

const FilterActionMenu = ({
  filterName,
  filterOptions,
  selectedFilters = [],
  setFilter,
}: FilterActionMenuProps) => {
  const handleCheckboxChange = (option: string) => {
    const isSelected = selectedFilters.includes(option);

    if (isSelected) {
      // Remove from selection
      setFilter(selectedFilters.filter((item) => item !== option));
    } else {
      // Add to selection
      setFilter([...selectedFilters, option]);
    }
  };

  return (
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
              checked={selectedFilters.includes(option)}
              onCheckedChange={() => handleCheckboxChange(option)}
            >
              {option}
            </ActionMenu.CheckboxItem>
          ))}
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu>
  );
};

export default FilterActionMenu;
