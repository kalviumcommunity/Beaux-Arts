"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Authcontext";
import { isAdmin } from "@/lib/permissions";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Palette,
  ShoppingBag,
  DollarSign,
  Search,
  Ban,
  Eye,
  Trash2,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

// Define types to match your API response
interface DashboardData {
  stats: {
    totalUsers: number;
    activeArtists: number;
    totalOrders: number;
    totalRevenue: number;
  };
  users: any[];
  artists: any[];
  artworks: any[];
  orders: any[];
}

export default function AdminDashboard() {
  const { user, isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData>({
    stats: { totalUsers: 0, activeArtists: 0, totalOrders: 0, totalRevenue: 0 },
    users: [],
    artists: [],
    artworks: [],
    orders: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check authorization
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !isAdmin(user))) {
      toast.error("Access denied. Admin only.");
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, user, router]);

  // Fetch Admin Data
  useEffect(() => {
    // Only fetch if authenticated and token exists
    if (!token || user?.role !== "ADMIN") return;

    async function fetchAdminData() {
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (result.success) {
          setData(result.data);
        } else {
          toast.error(result.message || "Failed to load admin data");
        }
      } catch (error) {
        console.error("Admin fetch error:", error);
        toast.error("Network error loading dashboard");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchAdminData();
  }, [token, user]);

  // --- GUARDS ---
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <Button onClick={() => router.push("/auth")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <Ban className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- HELPERS ---
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "SELLER":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    // Normalize status to lowercase for comparison
    const s = status?.toLowerCase();
    if (["active", "approved", "delivered"].includes(s)) return "default";
    if (["pending", "shipped"].includes(s)) return "secondary";
    if (["banned", "rejected", "cancelled"].includes(s)) return "destructive";
    return "outline";
  };

  const statsList = [
    {
      label: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Artists",
      value: data.stats.activeArtists,
      icon: Palette,
      color: "text-purple-500",
    },
    {
      label: "Total Orders",
      value: data.stats.totalOrders,
      icon: ShoppingBag,
      color: "text-green-500",
    },
    {
      label: "Revenue",
      value: `$${Number(data.stats.totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, artists, artworks, and orders
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsList.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search functionality coming soon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">#{u.id}</TableCell>
                        <TableCell>{u.fullname || "N/A"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(u.role)}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell suppressHydrationWarning>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Actions are placeholders for now */}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists">
            <Card>
              <CardHeader>
                <CardTitle>Artist Management</CardTitle>
                <CardDescription>
                  Manage artist applications and accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Artworks</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.artists.map((artist) => (
                      <TableRow key={artist.id}>
                        <TableCell className="font-medium">
                          #{artist.id}
                        </TableCell>
                        <TableCell>{artist.storeName}</TableCell>
                        <TableCell>{artist.email}</TableCell>
                        <TableCell>{artist.artworksCount}</TableCell>
                        <TableCell>{artist.commission}%</TableCell>
                        <TableCell suppressHydrationWarning>
                          {new Date(artist.joinedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artworks Tab */}
          <TabsContent value="artworks">
            <Card>
              <CardHeader>
                <CardTitle>Artwork Management</CardTitle>
                <CardDescription>
                  Review and manage all artworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.artworks.map((artwork) => (
                      <TableRow key={artwork.id}>
                        <TableCell className="font-medium">
                          #{artwork.id}
                        </TableCell>
                        <TableCell>{artwork.title}</TableCell>
                        <TableCell>
                          {artwork.artist?.storeName || "Unknown"}
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
                            {artwork.available ? "Active" : "Sold"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Artwork
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {artwork.title}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>
                          ${Number(order.total).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell suppressHydrationWarning>
                          {new Date(order.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
