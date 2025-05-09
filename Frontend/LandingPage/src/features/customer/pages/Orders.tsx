
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import OrderTabs from '../components/orders/OrderTabs';
import OrderCard from '../components/orders/OrderCard';
import OrderDetails from '../components/orders/OrderDetails';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Mock order data
const initialOrders = [
  {
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 123-4567',
    customerEmail: 'sarah@example.com',
    date: '2025-04-15',
    time: '10:00 AM',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    amount: 75.99,
    status: 'pending',
    serviceType: 'Haircut & Styling',
    paymentMethod: 'Credit Card',
    items: [
      { name: 'Haircut', description: 'Women\'s haircut', price: 45.99 },
      { name: 'Styling', description: 'Blowout and styling', price: 30.00 }
    ],
    tax: 6.08,
    note: 'Please call when you arrive at the building.'
  },
  {
    id: 'ORD-002',
    customerName: 'Michael Smith',
    customerPhone: '+1 (555) 987-6543',
    customerEmail: 'michael@example.com',
    date: '2025-04-16',
    time: '2:30 PM',
    address: '456 Oak Avenue, Chicago, IL 60611',
    amount: 120.00,
    status: 'in-progress',
    serviceType: 'Home Cleaning',
    paymentMethod: 'PayPal',
    items: [
      { name: 'Standard Cleaning', description: '3-bedroom home', price: 120.00 }
    ],
    tax: 10.00,
    note: 'Please focus on kitchen and bathrooms.'
  },
  {
    id: 'ORD-003',
    customerName: 'Emily Davis',
    customerPhone: '+1 (555) 456-7890',
    customerEmail: 'emily@example.com',
    date: '2025-04-14',
    time: '4:00 PM',
    address: '789 Pine Street, San Francisco, CA 94102',
    amount: 200.00,
    status: 'completed',
    serviceType: 'Car Rental',
    paymentMethod: 'Credit Card',
    items: [
      { name: 'Economy Car', description: '2-day rental', price: 200.00 }
    ],
    tax: 16.50,
    note: 'Will need child seat.'
  },
  {
    id: 'ORD-004',
    customerName: 'David Wilson',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'david@example.com',
    date: '2025-04-13',
    time: '1:00 PM',
    address: '321 Cedar Road, Seattle, WA 98101',
    amount: 60.00,
    status: 'cancelled',
    serviceType: 'Math Tutoring',
    paymentMethod: 'Cash',
    items: [
      { name: 'Math Tutoring', description: '2-hour session', price: 60.00 }
    ],
    tax: 0.00,
    note: 'Student needs help with algebra.'
  },
  {
    id: 'ORD-005',
    customerName: 'Jennifer Brown',
    customerPhone: '+1 (555) 876-5432',
    customerEmail: 'jennifer@example.com',
    date: '2025-04-17',
    time: '11:30 AM',
    address: '567 Maple Lane, Boston, MA 02108',
    amount: 90.00,
    status: 'pending',
    serviceType: 'Manicure & Pedicure',
    paymentMethod: 'Credit Card',
    items: [
      { name: 'Manicure', description: 'Gel polish', price: 35.00 },
      { name: 'Pedicure', description: 'Spa pedicure', price: 55.00 }
    ],
    tax: 7.20,
    note: ''
  }
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load orders (simulate API call)
  useEffect(() => {
    const loadOrders = () => {
      setTimeout(() => {
        setOrders(initialOrders);
        setLoading(false);
      }, 700); // Simulate loading delay
    };

    loadOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    const message = 
      newStatus === 'in-progress' ? 'Order accepted successfully' :
      newStatus === 'completed' ? 'Order marked as completed' :
      newStatus === 'cancelled' ? 'Order cancelled' : 'Order status updated';
    
    toast.success(message);
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'new') {
      return order.status === 'pending' || order.status === 'in-progress';
    } else {
      return order.status === 'completed' || order.status === 'cancelled';
    }
  });

  return (
    <Layout>
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

        <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-lg text-gray-600">Loading orders...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl text-gray-500">
                  {activeTab === 'new' 
                    ? 'No new orders at the moment' 
                    : 'No order history available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={handleViewDetails}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </Layout>
  );
};

export default Orders;
