// client/src/pages/admin-view/categories.jsx
// Admin page to manage storefront Category records, linked to Brands

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAdminCategories,
  addNewCategory,
  editCategory,
  deleteCategory,
} from "@/store/admin/categories-slice";
import { fetchAllAdminBrands } from "@/store/admin/brands-slice";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, FolderTree, Search, RefreshCw } from "lucide-react";

const emptyForm = {
  name: "", slug: "", parentId: "", brandIds: [], image: "",
  seoTitle: "", seoDescription: "", isActive: true, sortOrder: 0,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminCategories() {
  const dispatch = useDispatch();
  const { categoryList, isLoading } = useSelector((state) => state.adminCategories);
  const { brandList } = useSelector((state) => state.adminBrands);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    dispatch(fetchAllAdminCategories());
    dispatch(fetchAllAdminBrands());
  }, [dispatch]);

  const brandNameById = useMemo(() => {
    const map = {};
    brandList.forEach((b) => { map[b._id] = b.name; });
    return map;
  }, [brandList]);

  const categoryNameById = useMemo(() => {
    const map = {};
    categoryList.forEach((c) => { map[c._id] = c.name; });
    return map;
  }, [categoryList]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return categoryList;
    return categoryList.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
    );
  }, [categoryList, search]);

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setSlugTouched(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      parentId: category.parentId || "",
      brandIds: category.brandIds || [],
      image: category.image || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    });
    setEditId(category._id);
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

  const toggleBrand = (brandId) => {
    setForm((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(brandId)
        ? prev.brandIds.filter((id) => id !== brandId)
        : [...prev.brandIds, brandId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      slug: slugify(form.slug),
      parentId: form.parentId || null,
    };
    const result = editId
      ? await dispatch(editCategory({ id: editId, formData: payload }))
      : await dispatch(addNewCategory(payload));

    if (result.payload?.success) {
      toast({ title: editId ? "Category updated" : "Category added" });
      setFormOpen(false);
      dispatch(fetchAllAdminCategories());
    } else {
      toast({ title: result.payload?.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteCategory(pendingDeleteId));
    if (result.payload?.success) {
      toast({ title: "Category deleted" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const totalActive = categoryList.filter((c) => c.isActive).length;
  const totalTopLevel = categoryList.filter((c) => !c.parentId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage storefront categories and link them to one or more brands
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: categoryList.length, color: "bg-blue-50 text-blue-700" },
          { label: "Top-Level", value: totalTopLevel, color: "bg-purple-50 text-purple-700" },
          { label: "Active", value: totalActive, color: "bg-green-50 text-green-700" },
          { label: "Inactive", value: categoryList.length - totalActive, color: "bg-red-50 text-red-700" },
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
              placeholder="Search categories by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => { dispatch(fetchAllAdminCategories()); dispatch(fetchAllAdminBrands()); }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5" />
            Categories ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {categoryList.length === 0
                ? 'No categories yet. Click "Add Category" to create one.'
                : "No categories match your search."}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Brands</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {category.parentId ? categoryNameById[category.parentId] || "—" : "Top-level"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                        {(category.brandIds || []).length > 0
                          ? category.brandIds.map((id) => brandNameById[id] || "—").join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => { setPendingDeleteId(category._id); setDeleteDialogOpen(true); }}
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
            <DialogTitle>{editId ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Hair Mousse & Styling"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Slug *</Label>
                <Input
                  placeholder="e.g. hair-mousse"
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Parent Category</Label>
              <select
                value={form.parentId || ""}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">None (top-level)</option>
                {categoryList
                  .filter((c) => c._id !== editId)
                  .map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Linked Brands</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 max-h-40 overflow-y-auto">
                {brandList.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">No brands yet — add one first.</p>
                ) : (
                  brandList.map((brand) => (
                    <label key={brand._id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={form.brandIds.includes(brand._id)}
                        onCheckedChange={() => toggleBrand(brand._id)}
                      />
                      {brand.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>SEO Title</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                />
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
              {editId ? "Update" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this category. Any subcategories referencing it as a parent will become top-level.
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

export default AdminCategories;
