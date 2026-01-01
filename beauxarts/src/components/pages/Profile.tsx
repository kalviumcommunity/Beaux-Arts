"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/Authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User as UserIcon, Package, MapPin, LogOut, Edit2, Save, X, Loader2 } from 'lucide-react';

// --- Types based on your API ---
interface OrderItem {
  id: number;
  quantity: number;
  price: string | number;
  artwork: {
    title: string;
    image: string[];
  };
}

interface Order {
  id: number;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  items: OrderItem[];
}

interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PROCESSING: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  SHIPPED: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100'
};

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfile, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    phone: ''
  });

  // 1. Sync Form Data when User loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // 2. Fetch Real Data (Orders & Addresses)
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      setIsLoadingData(true);
      try {
        const [ordersRes, addrRes] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/shipping-addresses', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const ordersData = await ordersRes.json();
        const addrData = await addrRes.json();

        if (ordersData.success) setOrders(ordersData.data);
        if (addrData.success) setAddresses(addrData.data);

      } catch (error) {
        console.error("Failed to fetch profile data", error);
        toast.error("Could not load account data");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [token]);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Handle Profile Update
  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  // Protect Route
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card>
            <CardContent className="py-16">
              <UserIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Sign in to view your profile</h2>
              <Button onClick={() => router.push('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medium">My Account</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" /> Addresses
            </TabsTrigger>
          </TabsList>

          {/* --- PROFILE TAB --- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isAuthLoading}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Input value={user?.role || 'USER'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- ORDERS TAB --- */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/shop')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                              {order.status}
                            </Badge>
                            <p className="font-medium mt-1">${Number(order.totalAmount).toLocaleString()}</p>
                          </div>
                        </div>
                        <Separator className="mb-4" />
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                              <div className="relative w-16 h-16 bg-secondary rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.artwork.image[0] || '/placeholder.jpg'}
                                  alt={item.artwork.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.artwork.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ${Number(item.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- ADDRESSES TAB --- */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shipping Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                   <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No addresses saved yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Addresses are saved when you place an order.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4 relative">
                        <p className="font-medium">{address.addressLine1}</p>
                        {address.addressLine2 && <p className="text-sm">{address.addressLine2}</p>}
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}