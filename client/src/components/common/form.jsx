/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
// client/src/components/common/form.jsx
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { getCategoriesByBrand, getSubcategories } from "@/config";

// Merges a static {id,label} option list with a dynamically-fetched one,
// de-duplicating by id (case-insensitive).
function mergeOptions(staticOptions = [], dynamicOptions = []) {
  const byId = new Map();
  [...staticOptions, ...dynamicOptions].forEach((opt) => {
    if (!opt?.id) return;
    const key = String(opt.id).toLowerCase();
    if (!byId.has(key)) byId.set(key, opt);
  });
  return [...byId.values()];
}

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  // Optional: { brand: [{id,label}], category: [...], subcategory: [...] }
  // — live-fetched suggestions (e.g. from the Brands/Categories admin
  // collections) merged in alongside the static config lists. Purely
  // suggestions: the underlying field is still free text, so typing
  // something not in this list is always allowed.
  dynamicSuggestions = {},
}) {
  
  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      case "combo": {
        // An open text field with a suggestions dropdown (native datalist):
        // pick an existing value, or type a brand-new one — never blocked.
        const listId = `${getControlItem.name}-options`;
        const options = mergeOptions(
          getControlItem.options,
          dynamicSuggestions?.[getControlItem.name]
        );
        element = (
          <>
            <Input
              name={getControlItem.name}
              list={listId}
              placeholder={getControlItem.placeholder || getControlItem.label}
              id={getControlItem.name}
              value={value}
              onChange={(event) => {
                const newValue = event.target.value;
                setFormData({
                  ...formData,
                  [getControlItem.name]: newValue,
                  // Reset dependent fields when brand changes
                  ...(getControlItem.name === "brand" && { category: "", subcategory: "" }),
                });
              }}
            />
            <datalist id={listId}>
              {options.map((optionItem) => (
                <option key={optionItem.id} value={optionItem.id}>
                  {optionItem.label}
                </option>
              ))}
            </datalist>
          </>
        );
        break;
      }

      case "select":
        element = (
          <Select
            onValueChange={(value) => {
              setFormData({
                ...formData,
                [getControlItem.name]: value,
                // Reset dependent fields when brand or category changes
                ...(getControlItem.name === "brand" && { category: "", subcategory: "" }),
                ...(getControlItem.name === "category" && { subcategory: "" })
              });
            }}
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.placeholder || getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;

      case "select-dynamic": {
        // Get dynamic options based on brand/category — merges the static,
        // per-brand config list with any live-fetched suggestions, but
        // (like "combo" above) the field itself stays free text: an open
        // category list, not a closed one. This is what lets a bulk import
        // or a manually-typed value introduce a brand-new category.
        let staticOptions = [];
        if (getControlItem.name === "category" && formData.brand) {
          staticOptions = getCategoriesByBrand(formData.brand);
        } else if (getControlItem.name === "subcategory" && formData.brand && formData.category) {
          staticOptions = getSubcategories(formData.brand, formData.category);
        }
        const options = mergeOptions(staticOptions, dynamicSuggestions?.[getControlItem.name]);

        const disabled =
          (getControlItem.name === "category" && !formData.brand) ||
          (getControlItem.name === "subcategory" && !formData.category);

        const listId = `${getControlItem.name}-options`;
        element = (
          <>
            <Input
              name={getControlItem.name}
              list={listId}
              disabled={disabled}
              placeholder={
                getControlItem.name === "category" && !formData.brand
                  ? "Select a brand first"
                  : getControlItem.name === "subcategory" && !formData.category
                  ? "Select a category first"
                  : getControlItem.placeholder || getControlItem.label
              }
              id={getControlItem.name}
              value={value}
              onChange={(event) => {
                const newValue = event.target.value;
                setFormData({
                  ...formData,
                  [getControlItem.name]: newValue,
                  // Reset subcategory when category changes
                  ...(getControlItem.name === "category" && { subcategory: "" })
                });
              }}
            />
            <datalist id={listId}>
              {options.map((optionItem) => (
                <option key={optionItem.id} value={optionItem.id}>
                  {optionItem.label}
                </option>
              ))}
            </datalist>
          </>
        );
        break;
      }

      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => {
          const element = renderInputsByComponentType(controlItem);
          
          // Don't render if element is null (e.g. a conditionally hidden field)
          if (!element) return null;

          return (
            <div className="grid w-full gap-1.5" key={controlItem.name}>
              <Label className="mb-1">
                {controlItem.label}
                {controlItem.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {element}
            </div>
          );
        })}
      </div>
      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;