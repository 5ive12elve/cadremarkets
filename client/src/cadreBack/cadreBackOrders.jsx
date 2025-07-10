import { useEffect, useState } from 'react';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import { FiSearch, FiX, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import OrderStatistics from '../components/shared/OrderStatistics';
import GE02Loader from '../components/GE02Loader';
import pdfExporter from '../utils/pdfExporter';

const ORDER_STATUSES = {
  PLACED: 'placed',
  OUT_FOR_DELIVERY: 'out for delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const CadreBackOrders = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingDetails, setListingDetails] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState({});
  const [tempQuantities, setTempQuantities] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      // Fetch listing details for each item in the order
      selectedOrder.orderItems.forEach(item => {
        fetchListingDetails(item._id);
      });
    }
  }, [selectedOrder]);

  const fetchListingDetails = async (listingId) => {
    try {
      const response = await fetch(`/api/listing/get/${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch listing details');
      const data = await response.json();
      setListingDetails(prev => ({
        ...prev,
        [listingId]: data
      }));
    } catch (error) {
      console.error('Error fetching listing details:', error);
      toast.error('Failed to fetch listing details');
    }
  };

  const fetchOrders = async () => {
    try {
                  const response = await backofficeApiRequest('/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    filterOrders(value, selectedStatus);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    filterOrders(searchQuery, status);
  };

  const filterOrders = (search, status) => {
    let filtered = [...orders];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(order => 
        order._id?.toLowerCase().includes(searchLower) ||
        order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filtered = filtered.filter(order => order.status?.toLowerCase() === status.toLowerCase());
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      
      // Get the current order details
      const order = orders.find(o => o._id === orderId);
      if (!order) throw new Error('Order not found');

      // Update order status
      const response = await backofficeApiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      // Refresh listing details after status change to reflect any automatic updates
      if (selectedOrder && selectedOrder._id === orderId) {
        selectedOrder.orderItems.forEach(item => {
          fetchListingDetails(item._id);
        });
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      // If this is the selected order, update it too
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      // Trigger statistics refresh
      setRefreshTrigger(prev => prev + 1);
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusCheck = async (orderId, itemId, checkType) => {
    // Create a unique key for this status check
    const updateKey = `${orderId}-${itemId}-${checkType}`;
    
    // If already updating this status, don't do anything
    if (isUpdating[updateKey]) return;

    // Get current status
    const currentOrder = orders.find(order => order._id === orderId);
    const currentItem = currentOrder.orderItems.find(item => item._id === itemId);
    const newStatus = !(currentItem.statusChecks?.[checkType]);

    // Optimistically update UI
    const updatedOrders = orders.map(order => 
        order._id === orderId ? {
          ...order,
        orderItems: order.orderItems.map(item => 
          item._id === itemId ? {
            ...item,
            statusChecks: {
              ...item.statusChecks,
              [checkType]: newStatus
            }
          } : item
        )
        } : order
    );

    // Update all relevant states
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
    // Update selectedOrder to reflect changes immediately
    setSelectedOrder(updatedOrders.find(order => order._id === orderId));

    // Mark this status as updating
    setIsUpdating(prev => ({ ...prev, [updateKey]: true }));

    try {
      const response = await backofficeApiRequest(`/orders/${orderId}/items/${itemId}/status-checks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusChecks: {
            [checkType]: newStatus
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status check');
      }

      toast.success(`${checkType} ${newStatus ? 'completed' : 'unchecked'}`);
    } catch (error) {
      // Revert the optimistic update on error
      const revertedOrders = orders.map(order => 
        order._id === orderId ? {
          ...order,
          orderItems: order.orderItems.map(item => 
            item._id === itemId ? {
            ...item,
            statusChecks: {
              ...item.statusChecks,
                [checkType]: !newStatus
            }
            } : item
          )
        } : order
      );

      // Update all states with reverted data
      setOrders(revertedOrders);
      setFilteredOrders(revertedOrders);
      setSelectedOrder(revertedOrders.find(order => order._id === orderId));
      
      console.error('Error updating status check:', error);
      toast.error('Failed to update status check');
    } finally {
      // Clear the updating state
      setIsUpdating(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await backofficeApiRequest(`/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete order');

      setOrders(orders.filter(order => order._id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order._id !== orderId));
      setSelectedOrder(null);
      
      // Trigger statistics refresh
      setRefreshTrigger(prev => prev + 1);
      
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handleDeleteOrderItem = async (orderId, itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}" from this order? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await backofficeApiRequest(`/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete order item');

      const result = await response.json();
      
      if (result.orderDeleted) {
        // The entire order was deleted because no items remained
        setOrders(orders.filter(order => order._id !== orderId));
        setFilteredOrders(filteredOrders.filter(order => order._id !== orderId));
        setSelectedOrder(null);
        toast.success('Order item deleted successfully. Order was also deleted as it had no remaining items.');
      } else {
        // Update the orders list with the updated order
        const updatedOrders = orders.map(order => 
          order._id === orderId ? result.order : order
        );
        const updatedFilteredOrders = filteredOrders.map(order => 
          order._id === orderId ? result.order : order
        );
        
        setOrders(updatedOrders);
        setFilteredOrders(updatedFilteredOrders);
        setSelectedOrder(result.order);
        toast.success('Order item deleted successfully');
      }
      
      // Trigger statistics refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting order item:', error);
      toast.error('Failed to delete order item');
    }
  };

  const handleUpdateQuantity = async (orderId, itemId, newQuantity) => {
    try {
      const response = await backofficeApiRequest(`/orders/${orderId}/items/${itemId}/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newQuantity: parseInt(newQuantity) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }

      const result = await response.json();
      
      // Update the orders list with the updated order
      const updatedOrders = orders.map(order => 
        order._id === orderId ? result.order : order
      );
      const updatedFilteredOrders = filteredOrders.map(order => 
        order._id === orderId ? result.order : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedFilteredOrders);
      setSelectedOrder(result.order);
      
      // Clear editing state
      const itemKey = `${orderId}-${itemId}`;
      setEditingQuantity(prev => ({ ...prev, [itemKey]: false }));
      setTempQuantities(prev => ({ ...prev, [itemKey]: undefined }));
      
      // Trigger statistics refresh
      setRefreshTrigger(prev => prev + 1);
      
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const startEditingQuantity = (orderId, itemId, currentQuantity) => {
    const itemKey = `${orderId}-${itemId}`;
    setEditingQuantity(prev => ({ ...prev, [itemKey]: true }));
    setTempQuantities(prev => ({ ...prev, [itemKey]: currentQuantity }));
  };

  const cancelEditingQuantity = (orderId, itemId) => {
    const itemKey = `${orderId}-${itemId}`;
    setEditingQuantity(prev => ({ ...prev, [itemKey]: false }));
    setTempQuantities(prev => ({ ...prev, [itemKey]: undefined }));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchOrders();
    toast.success('Orders refreshed successfully');
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating comprehensive PDF report...');
      
      // Fetch detailed statistics
      let detailedStats = null;
      try {
        const response = await backofficeApiRequest('/orders/backoffice/statistics?timeframe=365');
        if (response.ok) {
          detailedStats = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch detailed statistics:', error);
      }

      // Calculate basic stats as fallback
      const stats = {
        total: orders.length,
        placed: orders.filter(o => o.status === 'placed').length,
        outForDelivery: orders.filter(o => o.status === 'out for delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };

      await pdfExporter.exportOrdersPDF(filteredOrders, stats, detailedStats);
      toast.dismiss();
      toast.success('Comprehensive PDF report exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export PDF');
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Orders"
        description="Manage and track all orders"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
                                      {isLoading ? <GE02Loader size="small" /> : <FiRefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Order Statistics Dashboard */}
      <OrderStatistics refreshTrigger={refreshTrigger} />

      <Card className="mb-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full bg-black border border-[#db2b2e] px-4 py-2 text-white focus:outline-none text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#db2b2e]" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedStatus === ''
                  ? 'bg-[#db2b2e] text-white'
                  : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
              } transition-colors whitespace-nowrap`}
              onClick={() => handleStatusFilter('')}
            >
              All
            </button>
            {Object.values(ORDER_STATUSES).map(status => (
              <button
                key={status}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                  selectedStatus === status
                    ? 'bg-[#db2b2e] text-white'
                    : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                } transition-colors whitespace-nowrap`}
                onClick={() => handleStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden md:block border border-[#db2b2e] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#db2b2e]">
                <th className="text-left p-3 lg:p-4 text-[#ffffff]/60 text-sm">Order Number</th>
                <th className="text-left p-3 lg:p-4 text-[#ffffff]/60 text-sm">Customer</th>
                <th className="text-left p-3 lg:p-4 text-[#ffffff]/60 text-sm">Status</th>
                <th className="text-left p-3 lg:p-4 text-[#ffffff]/60 text-sm">Date</th>
                <th className="text-right p-3 lg:p-4 text-[#ffffff]/60 text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-[#db2b2e]/20 cursor-pointer hover:bg-[#db2b2e]/5"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-3 lg:p-4 text-white text-sm">{order._id}</td>
                  <td className="p-3 lg:p-4 text-white text-sm">
                    {order.customerInfo?.name}
                  </td>
                  <td className="p-3 lg:p-4">
                    <span className={`px-2 py-1 text-xs ${
                      order.status === ORDER_STATUSES.DELIVERED
                        ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                        : order.status === ORDER_STATUSES.CANCELLED
                        ? 'bg-red-500/10 text-red-500'
                        : order.status === ORDER_STATUSES.OUT_FOR_DELIVERY
                        ? 'bg-[#f3eb4b]/10 text-[#f3eb4b]'
                        : 'bg-[#db2b2e]/10 text-[#db2b2e]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4 text-white text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 lg:p-4 text-white text-right text-sm">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="border border-[#db2b2e] p-4 cursor-pointer hover:bg-[#db2b2e]/5 transition-colors"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-medium text-sm">#{order._id}</p>
                  <p className="text-[#ffffff]/60 text-xs">{order.customerInfo?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs ${
                  order.status === ORDER_STATUSES.DELIVERED
                    ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                    : order.status === ORDER_STATUSES.CANCELLED
                    ? 'bg-red-500/10 text-red-500'
                    : order.status === ORDER_STATUSES.OUT_FOR_DELIVERY
                    ? 'bg-[#f3eb4b]/10 text-[#f3eb4b]'
                    : 'bg-[#db2b2e]/10 text-[#db2b2e]'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#ffffff]/60 text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="text-white font-bold text-sm">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-black border border-[#db2b2e] p-4 sm:p-6 lg:p-8 w-full max-w-5xl relative overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-4 right-4 text-[#db2b2e] hover:text-white transition-colors"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX size={24} />
              </button>

              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Order #{selectedOrder._id}
                  </h2>
                  <p className="text-[#ffffff]/60 text-sm sm:text-base">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="sm:text-right">
                <p className="text-white font-bold text-xl sm:text-2xl mb-4">
                    ${selectedOrder.totalPrice.toFixed(2)}
                  </p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end">
                    <button
                      onClick={() => {
                        const allChecksComplete = selectedOrder.orderItems.every(item => 
                          item.statusChecks?.itemReceived &&
                          item.statusChecks?.itemVerified &&
                          item.statusChecks?.itemPacked &&
                          item.statusChecks?.readyForShipment
                        );

                        if (!allChecksComplete && selectedOrder.status !== 'placed') {
                          toast.error('Please complete all preparation checks first');
                          return;
                        }

                        if (window.confirm('Are you sure you want to mark this order as Placed?')) {
                          handleStatusChange(selectedOrder._id, 'placed');
                        }
                      }}
                      disabled={isLoading}
                      className={`px-3 sm:px-4 py-2 border transition-colors text-sm sm:text-base ${
                        selectedOrder.status === 'placed'
                          ? 'bg-[#db2b2e] border-[#db2b2e] text-white'
                          : 'border-[#db2b2e]/20 text-[#ffffff]/60 hover:border-[#db2b2e] hover:text-white'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Updating...' : 'Placed'}
                    </button>
                    <button
                      onClick={() => {
                        const allChecksComplete = selectedOrder.orderItems.every(item => 
                          item.statusChecks?.itemReceived &&
                          item.statusChecks?.itemVerified &&
                          item.statusChecks?.itemPacked &&
                          item.statusChecks?.readyForShipment
                        );

                        if (!allChecksComplete) {
                          toast.error('Please complete all preparation checks before moving to Out for Delivery');
                          return;
                        }

                        if (window.confirm('Are you sure you want to mark this order as Out for Delivery?')) {
                          handleStatusChange(selectedOrder._id, 'out for delivery');
                        }
                      }}
                      disabled={isLoading || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                      className={`px-3 sm:px-4 py-2 border transition-colors text-sm sm:text-base ${
                        selectedOrder.status === 'out for delivery'
                          ? 'bg-[#db2b2e] border-[#db2b2e] text-white'
                          : 'border-[#db2b2e]/20 text-[#ffffff]/60 hover:border-[#db2b2e] hover:text-white'
                      } ${isLoading || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      {isLoading ? 'Updating...' : 'Out for Delivery'}
                    </button>
                    <button
                      onClick={() => {
                        const allChecksComplete = selectedOrder.orderItems.every(item => 
                          item.statusChecks?.itemReceived &&
                          item.statusChecks?.itemVerified &&
                          item.statusChecks?.itemPacked &&
                          item.statusChecks?.readyForShipment
                        );

                        if (!allChecksComplete) {
                          toast.error('Please complete all preparation checks before marking as Delivered');
                          return;
                        }

                        if (window.confirm('Are you sure you want to mark this order as Delivered?')) {
                          handleStatusChange(selectedOrder._id, 'delivered');
                        }
                      }}
                      disabled={isLoading || selectedOrder.status === 'cancelled'}
                      className={`px-4 py-2 border transition-colors ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-[#db2b2e] border-[#db2b2e] text-white'
                          : 'border-[#db2b2e]/20 text-[#ffffff]/60 hover:border-[#db2b2e] hover:text-white'
                      } ${isLoading || selectedOrder.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Updating...' : 'Delivered'}
                    </button>
                    <button
                      onClick={() => {
                        if (selectedOrder.status === 'cancelled') {
                          toast.error('Order is already cancelled');
                          return;
                        }

                        if (window.confirm('Are you sure you want to cancel this order? This will restore all items to their original state.')) {
                          handleStatusChange(selectedOrder._id, 'cancelled');
                        }
                      }}
                      disabled={isLoading || selectedOrder.status === 'cancelled'}
                      className={`px-4 py-2 border transition-colors ${
                        selectedOrder.status === 'cancelled'
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-red-500/20 text-red-500/60 hover:border-red-500 hover:text-red-500'
                      } ${isLoading || selectedOrder.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Updating...' : 'Cancel Order'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                        handleDeleteOrder(selectedOrder._id);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors self-end"
                  >
                    Delete Order
                  </button>
                </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-8 border border-[#db2b2e] p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Name</p>
                    <p className="text-white">{selectedOrder.customerInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Phone Number</p>
                    <p className="text-white">{selectedOrder.customerInfo.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">City</p>
                    <p className="text-white">{selectedOrder.customerInfo.city}</p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">District</p>
                    <p className="text-white">{selectedOrder.customerInfo.district}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#ffffff]/60 mb-1">Address</p>
                    <p className="text-white">{selectedOrder.customerInfo.address}</p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Payment Method</p>
                    <p className="text-white capitalize">{selectedOrder.customerInfo.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-8 border border-[#db2b2e] p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Items Total</p>
                    <p className="text-white text-lg font-medium">
                      ${selectedOrder.orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Shipment Fees</p>
                    <p className="text-white text-lg font-medium">
                      ${selectedOrder.shipmentFees.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#ffffff]/60 mb-1">Cadre Profit</p>
                    <p className="text-white text-lg font-medium">
                      ${selectedOrder.cadreProfit.toFixed(2)}
                    </p>
                  </div>
                <div className="col-span-3 border-t border-[#db2b2e]/20 pt-4 mt-2">
                    <p className="text-[#ffffff]/60 mb-1">Total Amount</p>
                    <p className="text-white text-2xl font-bold">
                      ${selectedOrder.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
            <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item) => (
                    <div
                      key={item._id}
                      className="border border-[#db2b2e] p-4"
                    >
                      {/* Item Basic Info */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="text-white font-medium text-lg mb-2">{item.name}</p>
                          <p className="text-[#ffffff]/60 text-sm">{item.description}</p>
                          {item.type === 'Clothing & Wearables' && item.selectedSize && (
                            <p className="text-[#db2b2e] text-sm font-medium mt-1">
                              Size: {item.selectedSize}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#ffffff]/60 text-sm">Quantity:</span>
                            {editingQuantity[`${selectedOrder._id}-${item._id}`] ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={tempQuantities[`${selectedOrder._id}-${item._id}`] || item.quantity}
                                  onChange={(e) => setTempQuantities(prev => ({
                                    ...prev,
                                    [`${selectedOrder._id}-${item._id}`]: e.target.value
                                  }))}
                                  className="w-16 px-2 py-1 bg-black border border-[#db2b2e] text-white text-sm focus:outline-none"
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(
                                    selectedOrder._id, 
                                    item._id, 
                                    tempQuantities[`${selectedOrder._id}-${item._id}`]
                                  )}
                                  className="px-2 py-1 bg-[#db2b2e] text-white text-xs hover:bg-[#db2b2e]/90 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => cancelEditingQuantity(selectedOrder._id, item._id)}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => startEditingQuantity(selectedOrder._id, item._id, item.quantity)}
                                  className="px-2 py-1 bg-[#db2b2e]/20 text-[#db2b2e] text-xs hover:bg-[#db2b2e] hover:text-white transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-white font-medium text-lg">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-[#ffffff]/60 text-sm">
                            Seller Profit: ${item.profit.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleDeleteOrderItem(selectedOrder._id, item._id, item.name)}
                            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm border border-red-600 hover:border-red-700 transition-colors"
                          >
                            Delete Item
                          </button>
                        </div>
                      </div>

                      {/* Status Checks */}
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {[
                        { key: 'itemReceived', label: 'Item Received' },
                        { key: 'itemVerified', label: 'Item Verified' },
                        { key: 'itemPacked', label: 'Item Packed' },
                        { key: 'readyForShipment', label: 'Ready for Shipment' }
                      ].map(({ key, label }) => {
                        const updateKey = `${selectedOrder._id}-${item._id}-${key}`;
                        const isChecked = item.statusChecks?.[key];
                        const isProcessing = isUpdating[updateKey];

                        return (
                          <div key={key} className="flex items-center justify-between p-3 border border-[#db2b2e]/20">
                            <span className="text-white">{label}</span>
                            <div className="flex items-center gap-3">
                              {isProcessing && (
                                <GE02Loader size="small" />
                              )}
                              <label className="relative inline-block w-12 h-6 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={isChecked}
                                  disabled={isProcessing}
                                  onChange={() => handleStatusCheck(selectedOrder._id, item._id, key)}
                                />
                                <div className="w-12 h-6 bg-black/50 peer-focus:outline-none rounded-full peer border border-[#db2b2e]/20 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#db2b2e] after:border-[#db2b2e] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#db2b2e]"></div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Listing Details */}
                    <div className="mt-6 border-t border-[#db2b2e]/20 pt-4">
                      <h5 className="text-white font-medium mb-3">Listing Details</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[#ffffff]/60 text-sm">Type</p>
                          <p className="text-white">{listingDetails[item._id]?.type || item.type || 'Loading...'}</p>
                        </div>
                        <div>
                          <p className="text-[#ffffff]/60 text-sm">Listing Type</p>
                          <p className="text-white capitalize">{listingDetails[item._id]?.listingType || 'Loading...'}</p>
                        </div>
                        {item.type === 'Clothing & Wearables' && item.selectedSize && (
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">Selected Size</p>
                            <p className="text-[#db2b2e] font-medium">{item.selectedSize}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[#ffffff]/60 text-sm">Quantity Ordered</p>
                          <p className="text-white">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[#ffffff]/60 text-sm">Status</p>
                          <p className="text-white capitalize">{listingDetails[item._id]?.status || 'Loading...'}</p>
                        </div>
                        <div>
                          <p className="text-[#ffffff]/60 text-sm">Cadremarkets Service</p>
                          <p className="text-white">{listingDetails[item._id]?.cadremarketsService ? 'Yes' : 'No'}</p>
                        </div>
                        </div>
                      </div>

                      {/* Seller Information */}
                    <div className="mt-6 border-t border-[#db2b2e]/20 pt-4">
                      <h5 className="text-white font-medium mb-3">Seller Information</h5>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">Name</p>
                            <p className="text-white">{item.sellerInfo.username}</p>
                          </div>
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">Email</p>
                            <p className="text-white">{item.sellerInfo.email}</p>
                          </div>
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">Phone</p>
                            <p className="text-white">{item.sellerInfo.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">Contact Preference</p>
                            <p className="text-white">{item.sellerInfo.contactPreference}</p>
                          </div>
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">City</p>
                            <p className="text-white">{item.sellerInfo.city}</p>
                          </div>
                          <div>
                            <p className="text-[#ffffff]/60 text-sm">District</p>
                            <p className="text-white">{item.sellerInfo.district}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[#ffffff]/60 text-sm">Address</p>
                            <p className="text-white">{item.sellerInfo.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CadreBackOrders;