// client/src/pages/admin-view/brands.jsx
// Admin page to manage storefront Brand records (Bio Saff, Saffron, Cornells, etc.)

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAdminBrands,
  addNewBrand,
  editBrand,
  deleteBrand,
} from "@/store/admin/brands-slice";
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
import { Pencil, Trash2, Plus, Tag, Search, RefreshCw } from "lucide-react";

const emptyForm = {
  name: "", slug: "", tagline: "", description: "", story: "",
  logoUrl: "", bannerUrl: "", themeColor: "#000000",
  isActive: true, sortOrder: 0,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminBrands() {
  const dispatch = useDispatch();
  const { brandList, isLoading } = useSelector((state) => state.adminBrands);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    dispatch(fetchAllAdminBrands());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return brandList;
    return brandList.filter(
      (b) => b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q)
    );
  }, [brandList, search]);

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setSlugTouched(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setForm({
      name: brand.name || "",
      slug: brand.slug || "",
      tagline: brand.tagline || "",
      description: brand.description || "",
      story: brand.story || "",
      logoUrl: brand.logoUrl || "",
      bannerUrl: brand.bannerUrl || "",
      themeColor: brand.themeColor || "#000000",
      isActive: brand.isActive ?? true,
      sortOrder: brand.sortOrder ?? 0,
    });
    setEditId(brand._id);
    setSlugTouched(true);
    setFormOpen(true);
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0, slug: slugify(form.slug) };
    const result = editId
      ? await dispatch(editBrand({ id: editId, formData: payload }))
      : await dispatch(addNewBrand(payload));

    if (result.payload?.success) {
      toast({ title: editId ? "Brand updated" : "Brand added" });
      setFormOpen(false);
      dispatch(fetchAllAdminBrands());
    } else {
      toast({ title: result.payload?.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteBrand(pendingDeleteId));
    if (result.payload?.success) {
      toast({ title: "Brand deleted" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const totalActive = brandList.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage storefront brands shown across Rekker Shop
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Brands", value: brandList.length, color: "bg-blue-50 text-blue-700" },
          { label: "Active", value: totalActive, color: "bg-green-50 text-green-700" },
          { label: "Inactive", value: brandList.length - totalActive, color: "bg-red-50 text-red-700" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className={`p-4 rounded-lg ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search brands by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchAllAdminBrands())} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Brands ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {brandList.length === 0
                ? 'No brands yet. Click "Add Brand" to create one.'
                : "No brands match your search."}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Tagline</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((brand) => (
                    <TableRow key={brand._id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: brand.themeColor || "#000" }}
                        />
                        {brand.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                        {brand.tagline || "—"}
                      </TableCell>
                      <TableCell>{brand.sortOrder ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={brand.isActive ? "default" : "secondary"}>
                          {brand.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(brand)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => { setPendingDeleteId(brand._id); setDeleteDialogOpen(true); }}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Brand" : "Add New Brand"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Bio Saff"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Slug *</Label>
                <Input
                  placeholder="e.g. bio-saff"
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Tagline</Label>
              <Input
                placeholder="e.g. Premium cosmetics and body care"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Short description shown on brand cards..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label>Brand Story (optional)</Label>
              <Textarea
                placeholder="Longer story shown on the brand page..."
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Logo URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Banner URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.bannerUrl}
                  onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Theme Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    className="h-10 w-14 p-1"
                    value={form.themeColor}
                    onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
                  />
                  <Input
                    value={form.themeColor}
                    onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active (visible on storefront)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {editId ? "Update" : "Add Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this brand. Products linked to it via brandId will no longer resolve to a brand page.
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

export default AdminBrands;
