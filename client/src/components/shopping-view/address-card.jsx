/* eslint-disable react/prop-types */
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { MapPin, Phone, FileText, Truck } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedId?._id === addressInfo?._id
          ? "border-blue-500 border-2 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Location Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {addressInfo?.county}
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold">
            <Truck className="w-3 h-3 mr-1" />
            KSh {addressInfo?.deliveryFee || 0}
          </Badge>
        </div>

        {/* Address Hierarchy */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">{addressInfo?.location}</div>
              <div className="text-gray-600">{addressInfo?.subCounty}</div>
              <div className="text-gray-500 text-xs">{addressInfo?.county}</div>
            </div>
          </div>
          
          {addressInfo?.specificAddress && (
            <div className="pl-6 text-sm text-gray-700">
              {addressInfo.specificAddress}
            </div>
          )}
        </div>

        {/* Phone */}
        {addressInfo?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-700">{addressInfo.phone}</Label>
          </div>
        )}

        {/* Notes */}
        {addressInfo?.notes && (
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <Label className="text-sm text-gray-600">{addressInfo.notes}</Label>
          </div>
        )}

        {/* Full Address Display */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
          {addressInfo?.address}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-gray-50 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
          className="flex-1"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;