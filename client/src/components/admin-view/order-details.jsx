/* eslint-disable react/prop-types */
// client/src/components/admin-view/order-details.jsx
import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { brandOptionsMap } from "@/config";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  // Group items by brand
  const itemsByBrand = orderDetails?.cartItems?.reduce((acc, item) => {
    const brand = item.brand || 'unknown';
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(item);
    return acc;
  }, {});

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Order Summary */}
        <div className="grid gap-2">
          <h2 className="text-xl font-bold mb-2">Order Summary</h2>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label className="text-sm">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label className="text-lg font-bold">KES {orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Badge variant={orderDetails?.paymentStatus === "paid" ? "default" : "secondary"}>
              {orderDetails?.paymentStatus}
            </Badge>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed" || orderDetails?.orderStatus === "delivered"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : orderDetails?.orderStatus === "inShipping"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        {/* Order Details by Brand */}
        <div className="grid gap-4">
          <div className="font-medium text-lg">Order Items</div>
          
          {itemsByBrand && Object.entries(itemsByBrand).map(([brand, items]) => (
            <div key={brand} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  brand === 'rekker' ? 'bg-blue-500' :
                  brand === 'saffron' ? 'bg-green-500' :
                  brand === 'cornells' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}></div>
                <h3 className="font-semibold">
                  {brandOptionsMap[brand] || brand}
                </h3>
                <Badge variant="outline" className="ml-auto">
                  {items.length} item{items.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <ul className="grid gap-3">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded">
                    <div className="flex gap-3 flex-1">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{item.title}</span>
                        {item.selectedVariation && (
                          <p className="text-sm text-muted-foreground">
                            Variation: {item.selectedVariation}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × KES {item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      KES {(item.quantity * item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        {/* Shipping Info */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium text-lg">Shipping Information</div>
            <div className="grid gap-0.5 text-muted-foreground bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Name:</span>
                <span>{user?.userName || orderDetails?.addressInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Address:</span>
                <span>{orderDetails?.addressInfo?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">City:</span>
                <span>{orderDetails?.addressInfo?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Pincode:</span>
                <span>{orderDetails?.addressInfo?.pincode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Phone:</span>
                <span>{orderDetails?.addressInfo?.phone}</span>
              </div>
              {orderDetails?.addressInfo?.notes && (
                <div className="mt-2 pt-2 border-t">
                  <span className="font-medium text-foreground">Notes:</span>
                  <p className="mt-1">{orderDetails?.addressInfo?.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Update Order Status */}
        <div>
          <h3 className="font-medium text-lg mb-3">Update Order Status</h3>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;