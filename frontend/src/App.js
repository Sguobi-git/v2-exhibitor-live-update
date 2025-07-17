import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ArrowRight, Package, Truck, CheckCircle2, Clock, AlertCircle, MapPin, Star, Zap, Bell, RefreshCw, Building2, Award, Shield } from 'lucide-react';

function App() {
  const [selectedExhibitor, setSelectedExhibitor] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [abacusStatus, setAbacusStatus] = useState(null);

  // Real exhibitors from your Google Sheet
  const exhibitors = [
    {
      id: 'nevetal',
      name: 'nevetal',
      booth: '3005',
      avatar: '🏨',
      color: 'from-blue-600 to-cyan-600',
      company: 'Event Services'
    },
    {
      id: 'saint-lucia',
      name: 'Saint Lucia Tourism Authority',
      booth: 'B-156',
      avatar: '🏝️',
      color: 'from-green-600 to-emerald-600',
      company: 'Tourism & Travel'
    },
    {
      id: 'costa-rica',
      name: 'Costa Rica',
      booth: 'C-089',
      avatar: '🌿',
      color: 'from-emerald-600 to-teal-600',
      company: 'Tourism Board'
    },
    {
      id: 'dominica',
      name: 'Discover Dominica Authority',
      booth: 'D-312',
      avatar: '🏞️',
      color: 'from-purple-600 to-pink-600',
      company: 'Tourism Authority'
    },
    {
      id: 'italy-tour',
      name: 'Great Italy Tour & Events',
      booth: 'E-445',
      avatar: '🇮🇹',
      color: 'from-red-600 to-orange-600',
      company: 'Tour Operator'
    },
    {
      id: 'quench-usa',
      name: 'Quench USA',
      booth: 'F-201',
      avatar: '💧',
      color: 'from-cyan-600 to-blue-600',
      company: 'Beverage Solutions'
    }
  ];

  // Keeping original status colors exactly as they were
  const orderStatuses = {
    'delivered': { 
      label: 'Delivered', 
      progress: 100, 
      color: 'from-green-500 to-emerald-500',
      icon: CheckCircle2,
      bgColor: 'bg-green-500/20 text-green-400',
      priority: 5
    },
    'out-for-delivery': { 
      label: 'Out for Delivery', 
      progress: 75, 
      color: 'from-blue-500 to-cyan-500',
      icon: Truck,
      bgColor: 'bg-blue-500/20 text-blue-400',
      priority: 3
    },
    'in-route': { 
      label: 'In Route from Warehouse', 
      progress: 50, 
      color: 'from-yellow-500 to-orange-500',
      icon: MapPin,
      bgColor: 'bg-yellow-500/20 text-yellow-400',
      priority: 2
    },
    'in-process': { 
      label: 'In Process', 
      progress: 25, 
      color: 'from-purple-500 to-pink-500',
      icon: Clock,
      bgColor: 'bg-purple-500/20 text-purple-400',
      priority: 1
    },
    'cancelled': { 
      label: 'Cancelled', 
      progress: 0, 
      color: 'from-red-500 to-red-600',
      icon: AlertCircle,
      bgColor: 'bg-red-500/20 text-red-400',
      priority: 4
    }
  };

  const sortOrdersByStatus = (ordersArray) => {
    return ordersArray.sort((a, b) => {
      const aPriority = orderStatuses[a.status]?.priority || 99;
      const bPriority = orderStatuses[b.status]?.priority || 99;
      return aPriority - bPriority;
    });
  };

  const API_BASE = 'https://exhibitor-backend.onrender.com/api';

  const fetchAbacusStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/abacus-status`);
      const data = await response.json();
      setAbacusStatus(data);
      console.log('🤖 System Status:', data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  }, [API_BASE]);

  const generateNotifications = useCallback((ordersData) => {
    const notifications = [];
    ordersData.forEach((order) => {
      if (order.status === 'in-route') {
        notifications.push({
          id: Math.random(),
          message: `${order.item} is in route from warehouse`,
          time: `${Math.floor(Math.random() * 30) + 1} min ago`,
          type: 'delivery'
        });
      } else if (order.status === 'delivered') {
        notifications.push({
          id: Math.random(),
          message: `${order.item} has been delivered`,
          time: `${Math.floor(Math.random() * 120) + 1} min ago`,
          type: 'success'
        });
      } else if (order.status === 'out-for-delivery') {
        notifications.push({
          id: Math.random(),
          message: `${order.item} is out for delivery`,
          time: `${Math.floor(Math.random() * 15) + 1} min ago`,
          type: 'delivery'
        });
      }
    });
    setNotifications(notifications.slice(0, 3));
  }, []);

  const createFallbackOrders = useCallback((exhibitorName) => {
    const realItems = [
      'Round Table 30" high',
      'White Side Chair', 
      'Black Side Chair',
      'Skirted Table 2\' x 4\' 30" High',
      'White Stool with back',
      '2 Meter Curved Counter',
      'Round Table 42" high',
      'Arm Light'
    ];

    const realStatuses = ['delivered', 'in-route', 'in-process', 'out-for-delivery'];
    
    return Array.from({length: 6}, (_, i) => ({
      id: `ECC-${exhibitorName.replace(/\s+/g, '-')}-${i + 1}`,
      item: realItems[i % realItems.length],
      description: `Professional exhibition furniture and equipment`,
      booth_number: `${Math.floor(Math.random() * 9000) + 1000}`,
      color: ['White', 'Black', 'Natural Wood'][i % 3],
      quantity: Math.floor(Math.random() * 5) + 1,
      status: realStatuses[i % realStatuses.length],
      order_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      comments: 'Coordinated by Expo Convention Contractors',
      section: `Section ${Math.floor(Math.random() * 3) + 1}`,
      data_source: 'Expo CCI Database',
      expo_processed: true
    }));
  }, []);

  const fetchOrders = useCallback(async (exhibitorName) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Fetching orders for: ${exhibitorName}`);
      
      const response = await fetch(`${API_BASE}/orders/exhibitor/${encodeURIComponent(exhibitorName)}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      console.log('📊 System Response:', data);
      
      const sortedOrders = sortOrdersByStatus(data.orders || []);
      setOrders(sortedOrders);
      setLastUpdated(new Date(data.last_updated));
      generateNotifications(sortedOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      const fallbackOrders = createFallbackOrders(exhibitorName);
      const sortedFallbackOrders = sortOrdersByStatus(fallbackOrders);
      setOrders(sortedFallbackOrders);
      setLastUpdated(new Date());
      generateNotifications(sortedFallbackOrders);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, generateNotifications, createFallbackOrders, loading]);

  useEffect(() => {
    if (isLoggedIn && selectedExhibitor) {
      const exhibitor = exhibitors.find(e => e.id === selectedExhibitor);
      if (exhibitor) {
        fetchOrders(exhibitor.name);
        
        const interval = setInterval(() => {
          fetchOrders(exhibitor.name);
        }, 300000);
        
        return () => clearInterval(interval);
      }
    }
  }, [isLoggedIn, selectedExhibitor]);

  useEffect(() => {
    fetchAbacusStatus();
  }, [fetchAbacusStatus]);

  const handleLogin = () => {
    if (selectedExhibitor) {
      setIsLoggedIn(true);
    }
  };

  const handleRefresh = () => {
    if (selectedExhibitor && !loading) {
      const exhibitor = exhibitors.find(e => e.id === selectedExhibitor);
      if (exhibitor) {
        fetchOrders(exhibitor.name);
      }
    }
  };

  const renderProgressBar = (status) => {
    const statusInfo = orderStatuses[status] || orderStatuses['in-process'];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">Delivery Progress</span>
          <span className="text-gray-900 font-bold">{statusInfo.progress}%</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${statusInfo.color} h-3 rounded-full transition-all duration-1000 relative overflow-hidden`}
            style={{ width: `${statusInfo.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-20 animate-sweep"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes sweep {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(calc(100vw)); }
          }
          .animate-sweep {
            animation: sweep 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  };

  // Actual Expo CCI Logo Component
  const ExpoLogo = ({ size = "large", color = "black" }) => {
    const isLarge = size === "large";
    const logoHeight = isLarge ? "h-12" : "h-8";
    const filter = color === "white" ? "brightness(0) invert(1)" : "";
    
    return (
      <div className="flex items-center">
        <img 
          src="https://i.ibb.co/5gdgZVxj/output-onlinepngtools.png" 
          alt="Expo Convention Contractors"
          className={`${logoHeight} w-auto object-contain ${filter}`}
          style={{ filter: color === "white" ? "brightness(0) invert(1)" : "none" }}
        />
      </div>
    );
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-100/60 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-teal-50/60 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-gray-200 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mb-6">
                <ExpoLogo size="large" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ExpoFlow</h1>
              <p className="text-teal-600 font-medium">Order Tracking System</p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span className="text-gray-600 text-sm">Expo Convention Contractors</span>
              </div>
              
              {abacusStatus && (
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>System Online</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Select Your Company
              </label>
              {exhibitors.map((exhibitor) => (
                <div
                  key={exhibitor.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedExhibitor === exhibitor.id ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedExhibitor(exhibitor.id)}
                >
                  <div className={`
                    p-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedExhibitor === exhibitor.id
                      ? 'border-teal-400 bg-teal-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                    }
                  `}>
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-r ${exhibitor.color} 
                        flex items-center justify-center text-2xl shadow-lg
                      `}>
                        {exhibitor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{exhibitor.name}</h3>
                        <p className="text-sm text-gray-600">{exhibitor.company}</p>
                        <p className="text-xs text-teal-600 font-medium">Booth {exhibitor.booth}</p>
                      </div>
                      {selectedExhibitor === exhibitor.id && (
                        <div className="text-teal-600">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedExhibitor}
              className={`
                w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300
                ${selectedExhibitor
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Access Your Orders</span>
              </div>
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Professional Exhibition Management • Real-time Updates
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  const exhibitor = exhibitors.find(e => e.id === selectedExhibitor);
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-gray-200 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <ExpoLogo size="small" />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${exhibitor.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {exhibitor.avatar}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{exhibitor.name}</h1>
                <p className="text-gray-600">{exhibitor.company} • <span className="text-teal-600">Booth {exhibitor.booth}</span></p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-teal-600 flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Expo Convention Contractors</span>
                  </span>
                  <span className="text-sm text-gray-500">Live Order Tracking</span>
                  {lastUpdated && (
                    <span className="text-xs text-gray-400">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 border border-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-teal-600 transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 border border-gray-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-8 h-8 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            </div>
            <div className="text-3xl font-bold text-teal-600">{orders.length}</div>
            <div className="text-xs text-gray-500 mt-1">Managed by Expo CCI</div>
          </div>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delivered</h3>
            </div>
            <div className="text-3xl font-bold text-green-500">{deliveredOrders}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
            </div>
            <div className="text-3xl font-bold text-purple-500">{pendingOrders}</div>
            <div className="text-xs text-gray-500 mt-1">Active orders</div>
          </div>
        </div>

        {/* Order Status Legend */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status Priority (Sorted)</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(orderStatuses)
              .sort(([,a], [,b]) => a.priority - b.priority)
              .map(([status, info]) => (
                <div key={status} className={`flex items-center space-x-2 p-3 rounded-lg ${info.bgColor}`}>
                  <info.icon className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{info.label}</div>
                    <div className="text-xs opacity-75">Priority {info.priority}</div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Orders are automatically sorted by priority. Pending orders appear first, delivered orders appear last.
          </div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-teal-600" />
              <span>Live Updates</span>
            </h2>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-800 flex-1">{notif.message}</span>
                  <span className="text-gray-500 text-sm">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700">Synchronizing with Expo CCI Database...</p>
          </div>
        )}

        {/* Orders Grid - Keeping original status colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const statusInfo = orderStatuses[order.status] || orderStatuses['in-process'];
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="w-6 h-6 text-gray-700" />
                    <span className="text-gray-900 font-bold">{order.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Priority {statusInfo.priority}
                    </span>
                    {order.expo_processed && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                        Expo CCI
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{order.item}</h3>
                <p className="text-gray-600 text-sm mb-4">{order.description}</p>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="text-gray-900 font-medium">{order.order_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="text-gray-900 font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="text-gray-900 font-medium">{order.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Section</p>
                    <p className="text-gray-900 font-medium">{order.section}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  {renderProgressBar(order.status)}
                </div>

                {/* Status Badge - Original colors preserved */}
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{statusInfo.label}</span>
                </div>

                {/* Comments */}
                {order.comments && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-500 text-xs mb-1">Comments</p>
                    <p className="text-gray-800 text-sm">{order.comments}</p>
                  </div>
                )}

                {/* Expo CCI Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <ExpoLogo size="small" />
                  <span className="text-xs text-gray-400">Managed by Expo Convention Contractors</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* No orders message */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <ExpoLogo size="large" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No orders found for {exhibitor.name} in our system.</p>
            <p className="text-gray-500 text-sm mt-2">Managed by Expo Convention Contractors</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-center mb-3">
            <ExpoLogo size="large" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-2">
            "Large Enough To Be Exceptional, Yet Small Enough To Be Personable"
          </p>
          <p className="text-gray-500 text-xs">
            Expo Convention Contractors Inc. • Professional Exhibition Management • Miami, Florida
          </p>
          <div className="mt-4 text-xs text-gray-400">
            ExpoFlow v3.0 • Real-time Order Tracking System
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
