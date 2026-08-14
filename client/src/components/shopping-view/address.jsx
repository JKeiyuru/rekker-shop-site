/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import { 
  getCounties, 
  getSubCounties, 
  getLocations, 
  getDeliveryFee 
} from "@/config/kenya-location-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const initialAddressFormData = {
  county: "",
  subCounty: "",
  location: "",
  specificAddress: "",
  phone: "",
  notes: "",
  deliveryFee: 0,
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [counties] = useState(getCounties());
  const [subCounties, setSubCounties] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  // Update sub-counties when county changes
  useEffect(() => {
    if (formData.county) {
      const newSubCounties = getSubCounties(formData.county);
      setSubCounties(newSubCounties);
      // Reset sub-county and location when county changes
      setFormData(prev => ({
        ...prev,
        subCounty: "",
        location: "",
        deliveryFee: 0
      }));
      setLocations([]);
    } else {
      setSubCounties([]);
      setLocations([]);
    }
  }, [formData.county]);

  // Update locations when sub-county changes
  useEffect(() => {
    if (formData.county && formData.subCounty) {
      const newLocations = getLocations(formData.county, formData.subCounty);
      setLocations(newLocations);
      // Reset location when sub-county changes
      setFormData(prev => ({
        ...prev,
        location: "",
        deliveryFee: 0
      }));
    } else {
      setLocations([]);
    }
  }, [formData.county, formData.subCounty]);

  // Update delivery fee when location changes
  useEffect(() => {
    if (formData.county && formData.subCounty && formData.location) {
      const deliveryFee = getDeliveryFee(formData.county, formData.subCounty, formData.location);
      setFormData(prev => ({
        ...prev,
        deliveryFee
      }));
    }
  }, [formData.county, formData.subCounty, formData.location]);

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const addressData = {
      county: formData.county,
      subCounty: formData.subCounty,
      location: formData.location,
      specificAddress: formData.specificAddress,
      phone: formData.phone,
      notes: formData.notes,
      deliveryFee: formData.deliveryFee,
      // Create a formatted address for display
      address: `${formData.specificAddress}, ${formData.location}, ${formData.subCounty}, ${formData.county}`,
    };

    currentEditedId !== null
      ? dispatch(
          editaAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData: addressData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...addressData,
            userId: user?.id,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData(initialAddressFormData);
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      county: getCurrentAddress?.county || "",
      subCounty: getCurrentAddress?.subCounty || "",
      location: getCurrentAddress?.location || "",
      specificAddress: getCurrentAddress?.specificAddress || "",
      phone: getCurrentAddress?.phone || "",
      notes: getCurrentAddress?.notes || "",
      deliveryFee: getCurrentAddress?.deliveryFee || 0,
    });
  }

  function isFormValid() {
    return (
      formData.county.trim() !== "" &&
      formData.subCounty.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.specificAddress.trim() !== "" &&
      formData.phone.trim() !== ""
    );
  }

  function handleSelectChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch, user?.id]);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addressList && addressList.length > 0
          ? addressList.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          : null}
      </div>
      <CardHeader>
        <CardTitle>
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleManageAddress} className="space-y-4">
          {/* County Selection */}
          <div className="space-y-2">
            <Label htmlFor="county">County <span className="text-red-500">*</span></Label>
            <Select
              value={formData.county}
              onValueChange={(value) => handleSelectChange("county", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select County" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county.value} value={county.value}>
                    {county.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-County Selection */}
          <div className="space-y-2">
            <Label htmlFor="subCounty">Sub-County <span className="text-red-500">*</span></Label>
            <Select
              value={formData.subCounty}
              onValueChange={(value) => handleSelectChange("subCounty", value)}
              disabled={!formData.county}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sub-County" />
              </SelectTrigger>
              <SelectContent>
                {subCounties.map((subCounty) => (
                  <SelectItem key={subCounty.value} value={subCounty.value}>
                    {subCounty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleSelectChange("location", value)}
              disabled={!formData.subCounty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label} - KSh {location.deliveryFee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specific Address */}
          <div className="space-y-2">
            <Label htmlFor="specificAddress">Specific Address <span className="text-red-500">*</span></Label>
            <Textarea
              id="specificAddress"
              placeholder="Enter building name, street, landmark, etc."
              value={formData.specificAddress}
              onChange={(e) => handleSelectChange("specificAddress", e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleSelectChange("phone", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional delivery instructions"
              value={formData.notes}
              onChange={(e) => handleSelectChange("notes", e.target.value)}
            />
          </div>

          {/* Delivery Fee Display */}
          {formData.deliveryFee > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800">Delivery Fee:</span>
                <span className="text-lg font-bold text-green-600">KSh {formData.deliveryFee}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!isFormValid()}
          >
            {currentEditedId !== null ? "Update Address" : "Add Address"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default Address;