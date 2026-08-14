// client/src/pages/admin-view/dashboard.jsx
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Package, ShoppingCart, TrendingUp, DollarSign, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { productList } = useSelector((state) => state.adminProducts);
  const { orderList } = useSelector((state) => state.adminOrder);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteFeatureImage(imageId) {
    dispatch(deleteFeatureImage(imageId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchAllProducts());
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // Calculate statistics
  const totalProducts = productList?.length || 0;
  const rekkerProducts = productList?.filter(p => p.brand === "rekker")?.length || 0;
  const saffronProducts = productList?.filter(p => p.brand === "saffron")?.length || 0;
  const cornellsProducts = productList?.filter(p => p.brand === "cornells")?.length || 0;

  const totalOrders = orderList?.length || 0;
  const pendingOrders = orderList?.filter(o => o.orderStatus === "pending")?.length || 0;
  const deliveredOrders = orderList?.filter(o => o.orderStatus === "delivered")?.length || 0;

  const totalRevenue = orderList?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  const lowStockProducts = productList?.filter(p => p.totalStock < 10)?.length || 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-blue-50">
                Rekker: {rekkerProducts}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50">
                Saffron: {saffronProducts}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50">
                Cornells: {cornellsProducts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {pendingOrders} pending • {deliveredOrders} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg: KES {averageOrderValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Products with stock &lt; 10
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium">Rekker</p>
                  <p className="text-sm text-muted-foreground">Parent Company Products</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{rekkerProducts}</p>
                <p className="text-xs text-muted-foreground">
                  {totalProducts > 0 ? ((rekkerProducts / totalProducts) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium">Saffron</p>
                  <p className="text-sm text-muted-foreground">Manufactured by Rekker</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{saffronProducts}</p>
                <p className="text-xs text-muted-foreground">
                  {totalProducts > 0 ? ((saffronProducts / totalProducts) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div>
                  <p className="font-medium">Cornells</p>
                  <p className="text-sm text-muted-foreground">Distributed by Rekker</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{cornellsProducts}</p>
                <p className="text-xs text-muted-foreground">
                  {totalProducts > 0 ? ((cornellsProducts / totalProducts) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Images Management */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Feature Images</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload banner images for the homepage carousel
          </p>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
            Upload Feature Image
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {featureImageList && featureImageList.length > 0
              ? featureImageList.map((featureImgItem) => (
                  <div key={featureImgItem._id} className="relative group">
                    <img
                      src={featureImgItem.image}
                      className="w-full h-[200px] object-cover rounded-lg"
                      alt="Feature"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              : <p className="text-sm text-muted-foreground col-span-full">No feature images uploaded yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;