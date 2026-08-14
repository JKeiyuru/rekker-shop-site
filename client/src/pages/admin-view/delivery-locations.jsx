// client/src/pages/admin-view/delivery-locations.jsx
// Admin page to manage delivery zones and fees

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDeliveryLocations,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
  seedDeliveryLocations,
} from "@/store/admin/delivery-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, MapPin, Download, Search, RefreshCw } from "lucide-react";

const emptyForm = {
  county: "", subCounty: "", location: "", deliveryFee: 0,
  isFreeDelivery: false, isActive: true, notes: "",
};

function AdminDeliveryLocations() {
  const dispatch = useDispatch();
  const { locations, isLoading } = useSelector((state) => state.adminDelivery);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllDeliveryLocations());
  }, [dispatch]);

  const counties = [...new Set(locations.map((l) => l.county))].sort();

  const filtered = locations.filter((l) => {
    const matchCounty = filterCounty === "all" || l.county === filterCounty;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.county.toLowerCase().includes(q) ||
      l.subCounty.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q);
    return matchCounty && matchSearch;
  });

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setForm({
      county: loc.county,
      subCounty: loc.subCounty,
      location: loc.location,
      deliveryFee: loc.deliveryFee,
      isFreeDelivery: loc.isFreeDelivery,
      isActive: loc.isActive,
      notes: loc.notes || "",
    });
    setEditId(loc._id);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.county.trim() || !form.subCounty.trim() || !form.location.trim()) {
      toast({ title: "County, Sub-County and Location are required", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      deliveryFee: form.isFreeDelivery ? 0 : Number(form.deliveryFee),
    };
    let result;
    if (editId) {
      result = await dispatch(updateDeliveryLocation({ id: editId, data: payload }));
    } else {
      result = await dispatch(createDeliveryLocation(payload));
    }
    if (result.payload?.success) {
      toast({ title: editId ? "Location updated!" : "Location added!" });
      setFormOpen(false);
      dispatch(fetchAllDeliveryLocations());
    } else {
      toast({ title: result.payload?.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteDeliveryLocation(pendingDeleteId));
    if (result.payload?.success) {
      toast({ title: "Location deleted!" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const handleSeed = async () => {
    const result = await dispatch(seedDeliveryLocations());
    if (result.payload?.success) {
      toast({ title: result.payload.message });
      dispatch(fetchAllDeliveryLocations());
    } else {
      toast({ title: result.payload?.message || "Seed failed", variant: "destructive" });
    }
  };

  const totalActive = locations.filter((l) => l.isActive).length;
  const totalFree = locations.filter((l) => l.isFreeDelivery).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Delivery Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage delivery zones and fees across Kenya
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSeed} className="gap-2">
            <Download className="w-4 h-4" />
            Seed Default Data
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Locations", value: locations.length, color: "bg-blue-50 text-blue-700" },
          { label: "Active", value: totalActive, color: "bg-green-50 text-green-700" },
          { label: "Free Delivery", value: totalFree, color: "bg-purple-50 text-purple-700" },
          { label: "Counties", value: counties.length, color: "bg-orange-50 text-orange-700" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className={`p-4 rounded-lg ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search county, sub-county, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterCounty}
            onChange={(e) => setFilterCounty(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white min-w-[160px]"
          >
            <option value="all">All Counties</option>
            {counties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchAllDeliveryLocations())} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Locations ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {locations.length === 0
                ? 'No locations yet. Click "Seed Default Data" to import Kenya locations.'
                : "No locations match your search."}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>County</TableHead>
                    <TableHead>Sub-County</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Delivery Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow key={loc._id}>
                      <TableCell className="font-medium">{loc.county}</TableCell>
                      <TableCell>{loc.subCounty}</TableCell>
                      <TableCell>{loc.location}</TableCell>
                      <TableCell>
                        {loc.isFreeDelivery ? (
                          <Badge className="bg-green-500">FREE</Badge>
                        ) : (
                          <span className="font-semibold">KES {loc.deliveryFee.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={loc.isActive ? "default" : "secondary"}>
                          {loc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {loc.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleOpenEdit(loc)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => { setPendingDeleteId(loc._id); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Location" : "Add New Location"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>County *</Label>
                <Input
                  placeholder="e.g. Nairobi"
                  value={form.county}
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Sub-County *</Label>
                <Input
                  placeholder="e.g. Westlands"
                  value={form.subCounty}
                  onChange={(e) => setForm({ ...form, subCounty: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Location Name *</Label>
              <Input
                placeholder="e.g. Parklands"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isFreeDelivery}
                onCheckedChange={(v) => setForm({ ...form, isFreeDelivery: v, deliveryFee: v ? 0 : form.deliveryFee })}
              />
              <Label>Free Delivery (e.g. CBD areas)</Label>
            </div>

            {!form.isFreeDelivery && (
              <div className="space-y-1">
                <Label>Delivery Fee (KES)</Label>
                <Input
                  type="number" min="0"
                  placeholder="e.g. 150"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active (visible to customers)</Label>
            </div>

            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any special delivery notes for this area..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {editId ? "Update" : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this delivery location. Customers will no longer be able to select it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminDeliveryLocations;