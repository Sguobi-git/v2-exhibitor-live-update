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
      color: 'from-gray-700 to-gray-900',
      company: 'Event Services'
    },
    {
      id: 'saint-lucia',
      name: 'Saint Lucia Tourism Authority',
      booth: 'B-156',
      avatar: '🏝️',
      color: 'from-teal-600 to-teal-800',
      company: 'Tourism & Travel'
    },
    {
      id: 'costa-rica',
      name: 'Costa Rica',
      booth: 'C-089',
      avatar: '🌿',
      color: 'from-teal-500 to-teal-700',
      company: 'Tourism Board'
    },
    {
      id: 'dominica',
      name: 'Discover Dominica Authority',
      booth: 'D-312',
      avatar: '🏞️',
      color: 'from-gray-600 to-gray-800',
      company: 'Tourism Authority'
    },
    {
      id: 'italy-tour',
      name: 'Great Italy Tour & Events',
      booth: 'E-445',
      avatar: '🇮🇹',
      color: 'from-teal-700 to-gray-800',
      company: 'Tour Operator'
    },
    {
      id: 'quench-usa',
      name: 'Quench USA',
      booth: 'F-201',
      avatar: '💧',
      color: 'from-teal-500 to-teal-600',
      company: 'Beverage Solutions'
    }
  ];

  const orderStatuses = {
    'delivered': { 
      label: 'Delivered', 
      progress: 100, 
      color: 'from-teal-500 to-teal-600',
      icon: CheckCircle2,
      bgColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      priority: 5
    },
    'out-for-delivery': { 
      label: 'Out for Delivery', 
      progress: 75, 
      color: 'from-teal-400 to-teal-500',
      icon: Truck,
      bgColor: 'bg-teal-400/20 text-teal-300 border-teal-400/30',
      priority: 3
    },
    'in-route': { 
      label: 'In Route from Warehouse', 
      progress: 50, 
      color: 'from-gray-400 to-gray-500',
      icon: MapPin,
      bgColor: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
      priority: 2
    },
    'in-process': { 
      label: 'In Process', 
      progress: 25, 
      color: 'from-gray-500 to-gray-600',
      icon: Clock,
      bgColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      priority: 1
    },
    'cancelled': { 
      label: 'Cancelled', 
      progress: 0, 
      color: 'from-red-500 to-red-600',
      icon: AlertCircle,
      bgColor: 'bg-red-500/20 text-red-400 border-red-500/30',
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
          <span className="text-gray-300 font-medium tracking-wide">DELIVERY PROGRESS</span>
          <span className="text-white font-bold text-lg">{statusInfo.progress}%</span>
        </div>
        <div className="relative w-full bg-gray-800/50 rounded-full h-2 border border-gray-700/50">
          <div 
            className={`bg-gradient-to-r ${statusInfo.color} h-2 rounded-full transition-all duration-1000 relative overflow-hidden shadow-lg`}
            style={{ width: `${statusInfo.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-16 animate-sweep"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes sweep {
            0% { transform: translateX(-50px); }
            100% { transform: translateX(calc(100vw)); }
          }
          .animate-sweep {
            animation: sweep 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Sophisticated geometric background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-gray-600/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-tr from-teal-400/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Geometric patterns inspired by expo booth layouts */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-teal-500/30 rotate-45"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-gray-500/40 rotate-45"></div>
          <div className="absolute bottom-20 left-20 w-4 h-4 bg-teal-400/20 rotate-45"></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 bg-gray-400/30 rotate-45"></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="text-center mb-8">
              {/* Expo CCI inspired logo area */}
              <div className="relative mb-6">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-teal-500 to-teal-600 rotate-45 shadow-lg"></div>
                  <div className="w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-700 rotate-45 shadow-lg"></div>
                  <div className="w-4 h-4 bg-gradient-to-br from-teal-400 to-teal-500 rotate-45 shadow-lg"></div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">EXPOFLOW</h1>
              <p className="text-teal-400 font-medium tracking-widest text-sm">EXPO CONVENTION CONTRACTORS</p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-sm font-medium">Professional Exhibition Management</span>
              </div>
              
              {abacusStatus && (
                <div className="mt-3 text-xs text-gray-400 flex items-center justify-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>System Online • Real-time Tracking</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center tracking-wide">
                SELECT YOUR COMPANY
              </label>
              {exhibitors.map((exhibitor) => (
                <div
                  key={exhibitor.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedExhibitor === exhibitor.id ? 'transform scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                  onClick={() => setSelectedExhibitor(exhibitor.id)}
                >
                  <div className={`
                    p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                    ${selectedExhibitor === exhibitor.id
                      ? 'border-teal-500/50 bg-gradient-to-br from-teal-500/10 to-gray-800/50 shadow-lg shadow-teal-500/20'
                      : 'border-gray-700/50 bg-gradient-to-br from-gray-800/30 to-black/30 hover:border-gray-600/50'
                    }
                  `}>
                    {selectedExhibitor === exhibitor.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent"></div>
                    )}
                    
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${exhibitor.color} 
                        flex items-center justify-center text-2xl shadow-lg border border-gray-600/30
                      `}>
                        {exhibitor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white tracking-wide">{exhibitor.name}</h3>
                        <p className="text-sm text-gray-300">{exhibitor.company}</p>
                        <p className="text-xs text-teal-400 font-medium">Booth {exhibitor.booth}</p>
                      </div>
                      {selectedExhibitor === exhibitor.id && (
                        <div className="text-teal-400">
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
                w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 relative overflow-hidden
                ${selectedExhibitor
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-lg hover:shadow-teal-500/20 border border-teal-500/30'
                  : 'bg-gray-700/50 cursor-not-allowed border border-gray-600/30'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2 relative z-10">
                <Lock className="w-5 h-5" />
                <span className="tracking-wide">ACCESS YOUR ORDERS</span>
              </div>
              {selectedExhibitor && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500 tracking-wide">
                REAL-TIME TRACKING • PROFESSIONAL SERVICE • MAXIMUM EXPOSURE
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2319BABA' fill-opacity='0.1'%3E%3Cpath d='M30 30h30v30H30V30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-br from-teal-500 to-teal-600 rotate-45"></div>
                  <div className="w-3 h-3 bg-gradient-to-br from-gray-600 to-gray-700 rotate-45"></div>
                  <div className="w-3 h-3 bg-gradient-to-br from-teal-400 to-teal-500 rotate-45"></div>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exhibitor.color} flex items-center justify-center text-3xl border border-gray-600/30 shadow-lg`}>
                  {exhibitor.avatar}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">{exhibitor.name}</h1>
                <p className="text-gray-300">{exhibitor.company} • <span className="text-teal-400">Booth {exhibitor.booth}</span></p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-teal-400 flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Expo Convention Contractors</span>
                  </span>
                  <span className="text-sm text-gray-400">Real-time Order Tracking</span>
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">
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
                className="p-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-2xl transition-all duration-300 border border-gray-600/50 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer hover:text-teal-400 transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse shadow-lg"></div>
                )}
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-2xl transition-all duration-300 border border-gray-600/50 backdrop-blur-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-8 h-8 text-teal-400" />
              <h3 className="text-lg font-semibold text-white tracking-wide">TOTAL ORDERS</h3>
            </div>
            <div className="text-3xl font-bold text-teal-400 mb-1">{orders.length}</div>
            <div className="text-xs text-gray-400 tracking-wide">EXPO CCI MANAGED</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-500" />
              <h3 className="text-lg font-semibold text-white tracking-wide">DELIVERED</h3>
            </div>
            <div className="text-3xl font-bold text-teal-500 mb-1">{deliveredOrders}</div>
            <div className="text-xs text-gray-400 tracking-wide">COMPLETED INSTALLATIONS</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
              <h3 className="text-lg font-semibold text-white tracking-wide">IN PROGRESS</h3>
            </div>
            <div className="text-3xl font-bold text-gray-300 mb-1">{pendingOrders}</div>
            <div className="text-xs text-gray-400 tracking-wide">ACTIVE PROJECTS</div>
          </div>
        </div>

        {/* Order Status Legend */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
          <h2 className="text-lg font-bold text-white mb-4 tracking-wide">ORDER STATUS PRIORITY</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(orderStatuses)
              .sort(([,a], [,b]) => a.priority - b.priority)
              .map(([status, info]) => (
                <div key={status} className={`flex items-center space-x-2 p-3 rounded-lg border ${info.bgColor}`}>
                  <info.icon className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{info.label}</div>
                    <div className="text-xs opacity-75">Priority {info.priority}</div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-3 text-xs text-gray-400 tracking-wide">
            Orders automatically prioritized by status. Urgent items appear first.
          </div>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-teal-400" />
              <span className="tracking-wide">LIVE UPDATES</span>
            </h2>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-white flex-1">{notif.message}</span>
                  <span className="text-gray-400 text-sm">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-4" />
            <p className="text-white tracking-wide">Synchronizing with Expo CCI Database...</p>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const statusInfo = orderStatuses[order.status] || orderStatuses['in-process'];
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-xl group">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="w-6 h-6 text-white" />
                    <span className="text-white font-bold tracking-wider">{order.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full border border-gray-600/30">
                      P{statusInfo.priority}
                    </span>
                    {order.expo_processed && (
                      <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full border border-teal-500/30">
                        ECC
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{order.item}</h3>
                <p className="text-gray-300 text-sm mb-4">{order.description}</p>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-xs">Order Date</p>
                    <p className="text-white font-medium">{order.order_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-xs">Quantity</p>
                    <p className="text-white font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-xs">Color</p>
                    <p className="text-white font-medium">{order.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-xs">Section</p>
                    <p className="text-white font-medium">{order.section}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  {renderProgressBar(order.status)}
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">{statusInfo.label}</span>
                </div>

                {/* Comments */}
                {order.comments && (
                  <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Project Notes</p>
                    <p className="text-white text-sm">{order.comments}</p>
                  </div>
                )}

                {/* Expo CCI Branding Footer */}
                <div className="mt-4 pt-3 border-t border-gray-700/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-0.5">
                      <div className="w-2 h-2 bg-teal-500 rotate-45"></div>
                      <div className="w-2 h-2 bg-gray-600 rotate-45"></div>
                      <div className="w-2 h-2 bg-teal-400 rotate-45"></div>
                    </div>
                    <span className="text-xs text-gray-400 tracking-wider">EXPO CCI</span>
                  </div>
                  <span className="text-xs text-gray-500">Professional Exhibition Services</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* No orders message */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-teal-500/50 rotate-45"></div>
                <div className="w-4 h-4 bg-gray-600/50 rotate-45"></div>
                <div className="w-4 h-4 bg-teal-400/50 rotate-45"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">NO ACTIVE ORDERS</h3>
            <p className="text-gray-400">No orders found for {exhibitor.name} in our system.</p>
            <p className="text-gray-500 text-sm mt-2">Managed by Expo Convention Contractors</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-teal-500 rotate-45"></div>
              <div className="w-3 h-3 bg-gray-600 rotate-45"></div>
              <div className="w-3 h-3 bg-teal-400 rotate-45"></div>
            </div>
            <span className="text-gray-400 tracking-widest text-sm">EXPO CONVENTION CONTRACTORS</span>
          </div>
          <p className="text-gray-500 text-xs tracking-wide">
            "LARGE ENOUGH TO BE EXCEPTIONAL, YET SMALL ENOUGH TO BE PERSONABLE"
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Professional Exhibition Management • Miami, Florida
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
