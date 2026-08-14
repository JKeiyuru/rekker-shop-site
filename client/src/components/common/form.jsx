/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
// client/src/components/common/form.jsx
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { getCategoriesByBrand, getSubcategories } from "@/config";

function CommonForm({ 
  formControls, 
  formData, 
  setFormData, 
  onSubmit, 
  buttonText,
  isBtnDisabled 
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

      case "select-dynamic":
        // Get dynamic options based on brand/category
        let dynamicOptions = [];
        
        if (getControlItem.name === "category" && formData.brand) {
          dynamicOptions = getCategoriesByBrand(formData.brand);
        } else if (getControlItem.name === "subcategory" && formData.brand && formData.category) {
          dynamicOptions = getSubcategories(formData.brand, formData.category);
        }

        // Check if this field should be shown (subcategory only for Saffron and Cornells)
        if (getControlItem.showWhen && !getControlItem.showWhen.includes(formData.brand)) {
          return null; // Don't render subcategory for Rekker
        }

        element = (
          <Select
            onValueChange={(value) => {
              setFormData({
                ...formData,
                [getControlItem.name]: value,
                // Reset subcategory when category changes
                ...(getControlItem.name === "category" && { subcategory: "" })
              });
            }}
            value={value}
            disabled={
              (getControlItem.name === "category" && !formData.brand) ||
              (getControlItem.name === "subcategory" && !formData.category)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={
                  getControlItem.name === "category" && !formData.brand
                    ? "Select brand first"
                    : getControlItem.name === "subcategory" && !formData.category
                    ? "Select category first"
                    : getControlItem.placeholder || getControlItem.label
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {dynamicOptions && dynamicOptions.length > 0
                ? dynamicOptions.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : <SelectItem value="none" disabled>No options available</SelectItem>}
            </SelectContent>
          </Select>
        );
        break;

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
          
          // Don't render if element is null (hidden field like subcategory for Rekker)
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