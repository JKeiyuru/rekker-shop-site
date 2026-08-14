/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// client/src/components/shopping-view/filter.jsx - Rekker Product Filter with Fixed Subcategories
import { Fragment, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import {
  brandOptions,
  rekkerCategories,
  saffronCategories,
  cornellsCategories,
} from "@/config";

function ProductFilter({ filters, handleFilter }) {
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    rekker: false,
    saffron: false,
    cornells: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    // Create a copy of current filters to clear
    const filterKeys = Object.keys(filters);
    filterKeys.forEach(key => {
      if (Array.isArray(filters[key])) {
        // Remove each filter value individually
        filters[key].forEach(value => {
          handleFilter(key, value);
        });
      }
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.values(filters).forEach(filterArray => {
      if (Array.isArray(filterArray)) {
        count += filterArray.length;
      }
    });
    return count;
  };

  const isFilterActive = (key, value) => {
    return filters?.[key]?.includes(value) || false;
  };

  // Enhanced filter handler to ensure proper state updates
  const handleFilterClick = (filterType, value) => {
    handleFilter(filterType, value);
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="rounded-full text-xs text-primary"
            >
              <X className="w-3 h-3 mr-1" />
              Clear ({getActiveFilterCount()})
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Brand Filter */}
        <div>
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-primary">
              Brand
            </h3>
            {expandedSections.brand ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.brand && (
            <div className="space-y-2 ml-2">
              {brandOptions.map((brand) => (
                <Label
                  key={brand.id}
                  className="flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <Checkbox
                    checked={isFilterActive("brand", brand.id)}
                    onCheckedChange={() => handleFilterClick("brand", brand.id)}
                  />
                  <span className="font-medium text-sm">{brand.label}</span>
                  {isFilterActive("brand", brand.id) && (
                    <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                  )}
                </Label>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Rekker Categories */}
        <div>
          <button
            onClick={() => toggleSection('rekker')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-primary">
                Rekker Products
              </h3>
            </div>
            {expandedSections.rekker ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.rekker && (
            <div className="space-y-2 ml-5">
              {rekkerCategories.map((category) => (
                <Label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <Checkbox
                    checked={isFilterActive("category", category.id)}
                    onCheckedChange={() => handleFilterClick("category", category.id)}
                  />
                  <span className="font-medium text-sm">{category.label}</span>
                  {isFilterActive("category", category.id) && (
                    <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                  )}
                </Label>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Saffron Categories with Subcategories */}
        <div>
          <button
            onClick={() => toggleSection('saffron')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent"></div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-primary">
                Saffron Products
              </h3>
            </div>
            {expandedSections.saffron ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.saffron && (
            <div className="space-y-3 ml-5">
              {saffronCategories.map((category) => (
                <div key={category.id}>
                  <Label className="flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary font-semibold">
                    <Checkbox
                      checked={isFilterActive("category", category.id)}
                      onCheckedChange={() => handleFilterClick("category", category.id)}
                    />
                    <span className="text-sm">{category.label}</span>
                    {isFilterActive("category", category.id) && (
                      <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                    )}
                  </Label>
                  {/* Subcategories */}
                  <div className="ml-6 mt-2 space-y-1">
                    {category.subcategories.map((subcat) => (
                      <Label
                        key={subcat.id}
                        className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-secondary"
                      >
                        <Checkbox
                          checked={isFilterActive("subcategory", subcat.id)}
                          onCheckedChange={() => handleFilterClick("subcategory", subcat.id)}
                        />
                        <span className="text-xs">{subcat.label}</span>
                        {isFilterActive("subcategory", subcat.id) && (
                          <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Cornells Categories with Subcategories */}
        <div>
          <button
            onClick={() => toggleSection('cornells')}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ink"></div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-primary">
                Cornells Products
              </h3>
            </div>
            {expandedSections.cornells ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.cornells && (
            <div className="space-y-3 ml-5">
              {cornellsCategories.map((category) => (
                <div key={category.id}>
                  <Label className="flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary font-semibold">
                    <Checkbox
                      checked={isFilterActive("category", category.id)}
                      onCheckedChange={() => handleFilterClick("category", category.id)}
                    />
                    <span className="text-sm">{category.label}</span>
                    {isFilterActive("category", category.id) && (
                      <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                    )}
                  </Label>
                  {/* Subcategories */}
                  <div className="ml-6 mt-2 space-y-1">
                    {category.subcategories.map((subcat) => (
                      <Label
                        key={subcat.id}
                        className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-secondary"
                      >
                        <Checkbox
                          checked={isFilterActive("subcategory", subcat.id)}
                          onCheckedChange={() => handleFilterClick("subcategory", subcat.id)}
                        />
                        <span className="text-xs">{subcat.label}</span>
                        {isFilterActive("subcategory", subcat.id) && (
                          <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductFilter;