"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Authcontext";
import { canAccessArtistDashboard } from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Plus,
  Edit,
  Loader2,
  Lock,
} from "lucide-react";

export default function ArtistDashboard() {
  const { user, isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Data State
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalSalesCount: 0,
    totalRevenue: 0,
  });
  const [artworks, setArtworks] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Add Artwork Form State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    price: "",
    description: "",
    medium: "",
    dimensions: "",
    year: "",
    image: "",
    stock: "1", // Default stock
  });

  // Check authorization
  useEffect(() => {
    if (!isAuthLoading && !canAccessArtistDashboard(user)) {
      toast.error("Access denied. Artists only.");
      router.push("/");
    }
  }, [isAuthLoading, user, router]);

  // 1. Fetch Dashboard Data
  useEffect(() => {
    if (!token) return;

    async function fetchDashboard() {
      try {
        const res = await fetch("/api/artists/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setStats(data.data.stats);
          setArtworks(data.data.artworks);
          setSales(data.data.sales);
        }
      } catch (error) {
        console.error("Dashboard error", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchDashboard();
  }, [token]);

  // 2. Handle Add Artwork Submit
  const handleAddArtwork = async () => {
    if (!newArtwork.title || !newArtwork.price || !newArtwork.image) {
      toast.error("Please fill in required fields (Title, Price, Image)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newArtwork,
          price: parseFloat(newArtwork.price),
          year: parseInt(newArtwork.year) || new Date().getFullYear(),
          stock: parseInt(newArtwork.stock),
          image: [newArtwork.image], // Convert string to array
          categoryIds: [1],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Artwork listed successfully!");
        setArtworks([data.data, ...artworks]); // Optimistic update
        setIsAddDialogOpen(false);
        setNewArtwork({
          title: "",
          price: "",
          description: "",
          medium: "",
          dimensions: "",
          year: "",
          image: "",
          stock: "1",
        });
      } else {
        toast.error(data.message || "Failed to create artwork");
      }
    } catch (error) {
      toast.error("Error creating artwork");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth & Role Guards
  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <Button onClick={() => router.push("/auth")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  if (user?.role !== "SELLER" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Seller Account Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to apply as an artist to access this dashboard.
          </p>
          <Button onClick={() => router.push("/apply")}>Apply as Artist</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Artist Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your artworks and track sales
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" /> Add Artwork
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Artwork</DialogTitle>
                <DialogDescription>
                  Fill in the details to list a new artwork.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={newArtwork.title}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, title: e.target.value })
                      }
                      placeholder="Artwork title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($) *</Label>
                    <Input
                      type="number"
                      value={newArtwork.price}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newArtwork.description}
                    onChange={(e) =>
                      setNewArtwork({
                        ...newArtwork,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your artwork..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Medium</Label>
                    <Input
                      value={newArtwork.medium}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, medium: e.target.value })
                      }
                      placeholder="Oil on canvas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dimensions</Label>
                    <Input
                      value={newArtwork.dimensions}
                      onChange={(e) =>
                        setNewArtwork({
                          ...newArtwork,
                          dimensions: e.target.value,
                        })
                      }
                      placeholder="24 x 36 inches"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={newArtwork.year}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, year: e.target.value })
                      }
                      placeholder="2024"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Image URL *</Label>
                    <Input
                      value={newArtwork.image}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={newArtwork.stock}
                      onChange={(e) =>
                        setNewArtwork({ ...newArtwork, stock: e.target.value })
                      }
                      placeholder="1"
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-2"
                  onClick={handleAddArtwork}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "List Artwork"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Artworks</p>
                <p className="text-2xl font-bold">{stats.totalArtworks}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats.totalSalesCount}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold">20%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="artworks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="artworks">My Artworks</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks">
            <Card>
              <CardHeader>
                <CardTitle>My Artworks</CardTitle>
                <CardDescription>Manage your listed artworks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <Loader2 className="animate-spin mx-auto py-10" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artworks.map((artwork) => (
                        <TableRow key={artwork.id}>
                          <TableCell className="font-medium">
                            {artwork.title}
                          </TableCell>
                          <TableCell>
                            ${Number(artwork.price).toLocaleString()}
                          </TableCell>
                          <TableCell>{artwork.stock}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                artwork.available ? "default" : "secondary"
                              }
                            >
                              {artwork.available ? "Active" : "Sold Out"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Track orders for your artworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <Loader2 className="animate-spin mx-auto py-10" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Artwork</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No sales yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        sales.map((sale) => (
                          <TableRow key={sale.itemId}>
                            <TableCell className="font-medium">
                              #{sale.id}
                            </TableCell>
                            <TableCell>{sale.artwork}</TableCell>
                            <TableCell>{sale.buyer}</TableCell>
                            <TableCell suppressHydrationWarning>
                              {new Date(sale.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              ${Number(sale.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
