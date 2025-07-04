import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Brand colors
const COLORS = {
  primary: '#db2b2e',
  secondary: '#f3eb4b',
  black: '#000000',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5'
};

class PDFExporter {
  constructor() {
    this.doc = null;
  }

  initializePDF() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.doc.setFont('helvetica');
  }

  async addHeader() {
    // Add minimal header with branding
    this.doc.setFontSize(20);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CADRE MARKETS', 20, 25);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.gray);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Business Intelligence Report', 20, 32);
    
    // Add line separator
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 38, 190, 38);
  }

  addFooter(pageNumber, totalPages) {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Add line separator
    this.doc.setDrawColor(COLORS.lightGray);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Page number and date
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.gray);
    this.doc.text(`Page ${pageNumber} of ${totalPages}`, 20, pageHeight - 12);
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, 120, pageHeight - 12);
    this.doc.text('CADRE MARKETS', 170, pageHeight - 12);
  }

  async exportListingsPDF(listings) {
    this.initializePDF();
    let pageNumber = 1;
    
    await this.addHeader();
    
    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LISTINGS ANALYTICS REPORT', 20, 50);
    
    let yPosition = 65;

    // Calculate metrics from actual listings data
    const totalValue = listings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const avgPrice = listings.length > 0 ? totalValue / listings.length : 0;
    const activeListings = listings.filter(l => l.status === 'For Sale').length;
    const soldListings = listings.filter(l => l.status === 'Sold').length;
    const pendingListings = listings.filter(l => l.status === 'Pending').length;
    const stockItems = listings.filter(l => l.type === 'Stock').length;
    const uniqueItems = listings.filter(l => l.type === 'Unique').length;
    const categories = [...new Set(listings.map(l => l.type).filter(Boolean))].length;

    // Statistics section
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KEY METRICS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    const metrics = [
      ['Total Listings', `${listings.length}`, 'Active Listings', `${activeListings}`],
      ['Total Value', `${totalValue.toLocaleString()} EGP`, 'Avg Price', `${avgPrice.toLocaleString()} EGP`],
      ['Sold Items', `${soldListings}`, 'Pending Items', `${pendingListings}`],
      ['Stock Items', `${stockItems}`, 'Unique Items', `${uniqueItems}`],
      ['Categories', `${categories}`, 'Success Rate', `${listings.length > 0 ? ((soldListings / listings.length) * 100).toFixed(1) : 0}%`]
    ];

    metrics.forEach(([label1, value1, label2, value2]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label1}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value1}`, 55, yPosition);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label2}:`, 110, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value2}`, 150, yPosition);
      
      yPosition += 8;
    });
    yPosition += 10;

    // Listings table
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LISTINGS SUMMARY', 20, yPosition);
    yPosition += 10;

    // Create table data
    const tableData = listings.map(listing => [
      listing.name?.substring(0, 25) || 'N/A',
      listing.type || 'N/A',
      `${(listing.price || 0).toLocaleString()} EGP`,
      listing.status || 'N/A',
      `${listing.city || 'N/A'}, ${listing.district || 'N/A'}`,
      new Date(listing.createdAt).toLocaleDateString()
    ]);

    // Draw table headers manually
    this.doc.setFontSize(9);
    this.doc.setTextColor(COLORS.white);
    this.doc.setFillColor(219, 43, 46);
    this.doc.rect(20, yPosition, 170, 8, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Name', 22, yPosition + 6);
    this.doc.text('Type', 52, yPosition + 6);
    this.doc.text('Price', 72, yPosition + 6);
    this.doc.text('Status', 102, yPosition + 6);
    this.doc.text('Location', 130, yPosition + 6);
    this.doc.text('Date', 165, yPosition + 6);
    yPosition += 10;

    // Draw table data manually
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    tableData.slice(0, 15).forEach((row, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(20, yPosition - 2, 170, 8, 'F');
      }
      
      this.doc.text(row[0] || 'N/A', 22, yPosition + 4);
      this.doc.text(row[1] || 'N/A', 52, yPosition + 4);
      this.doc.text(row[2] || 'N/A', 72, yPosition + 4);
      this.doc.text(row[3] || 'N/A', 102, yPosition + 4);
      this.doc.text((row[4] || 'N/A').substring(0, 15), 130, yPosition + 4);
      this.doc.text(row[5] || 'N/A', 165, yPosition + 4);
      yPosition += 8;
    });

    this.addFooter(pageNumber, pageNumber);
    this.doc.save(`cadre-markets-listings-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async exportOrdersPDF(orders) {
    this.initializePDF();
    let pageNumber = 1;
    
    await this.addHeader();
    
    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ORDERS ANALYTICS REPORT', 20, 50);
    
    let yPosition = 65;

    // Calculate metrics from actual orders data
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const placedOrders = orders.filter(o => o.status === 'placed').length;
    const outForDeliveryOrders = orders.filter(o => o.status === 'out for delivery').length;

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const cashOrders = orders.filter(o => o.customerInfo?.paymentMethod === 'cash').length;
    const instapayOrders = orders.filter(o => o.customerInfo?.paymentMethod === 'instapay').length;
    const activeOrders = placedOrders + outForDeliveryOrders;
    
    // Statistics section
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('REVENUE METRICS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    const metrics = [
      ['Total Orders', `${orders.length}`, 'Total Revenue', `${totalRevenue.toLocaleString()} EGP`],
      ['Delivered Orders', `${deliveredOrders}`, 'Cadre Profit', `${Math.round(totalRevenue * 0.1).toLocaleString()} EGP`],
      ['Avg Order Value', `${avgOrderValue.toLocaleString()} EGP`, 'Cash Orders', `${cashOrders}`],
      ['Active Orders', `${activeOrders}`, 'Instapay Orders', `${instapayOrders}`]
    ];

    metrics.forEach(([label1, value1, label2, value2]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label1}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value1}`, 55, yPosition);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label2}:`, 110, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value2}`, 150, yPosition);
      
      yPosition += 8;
    });
    yPosition += 10;

    // Orders table
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ORDERS SUMMARY', 20, yPosition);
    yPosition += 10;

    // Create table data
    const tableData = orders.map(order => [
      order._id?.substring(-8) || 'N/A',
      order.customerInfo?.name || 'N/A',
      `${(order.totalPrice || 0).toLocaleString()} EGP`,
      order.status || 'N/A',
      order.customerInfo?.paymentMethod || 'N/A',
      new Date(order.createdAt).toLocaleDateString()
    ]);

    // Draw table headers manually
    this.doc.setFontSize(9);
    this.doc.setTextColor(COLORS.white);
    this.doc.setFillColor(219, 43, 46);
    this.doc.rect(20, yPosition, 170, 8, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Order ID', 22, yPosition + 6);
    this.doc.text('Customer', 45, yPosition + 6);
    this.doc.text('Total', 75, yPosition + 6);
    this.doc.text('Status', 100, yPosition + 6);
    this.doc.text('Payment', 130, yPosition + 6);
    this.doc.text('Date', 165, yPosition + 6);
    yPosition += 10;

    // Draw table data manually
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    tableData.slice(0, 15).forEach((row, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(20, yPosition - 2, 170, 8, 'F');
      }
      
      this.doc.text(row[0] || 'N/A', 22, yPosition + 4);
      this.doc.text((row[1] || 'N/A').substring(0, 12), 45, yPosition + 4);
      this.doc.text(row[2] || 'N/A', 75, yPosition + 4);
      this.doc.text(row[3] || 'N/A', 100, yPosition + 4);
      this.doc.text(row[4] || 'N/A', 130, yPosition + 4);
      this.doc.text(row[5] || 'N/A', 165, yPosition + 4);
      yPosition += 8;
    });

    this.addFooter(pageNumber, pageNumber);
    this.doc.save(`cadre-markets-orders-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async exportCustomerServicePDF(requests) {
    this.initializePDF();
    let pageNumber = 1;
    
    await this.addHeader();
    
    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CUSTOMER SERVICE REPORT', 20, 50);
    
    let yPosition = 65;

    // Calculate metrics from actual requests data
    const resolvedRequests = requests.filter(r => r.status === 'resolved').length;
    const closedRequests = requests.filter(r => r.status === 'closed').length;
    const newRequests = requests.filter(r => r.status === 'new').length;
    const inProgressRequests = requests.filter(r => r.status === 'in-progress').length;
    const highPriorityRequests = requests.filter(r => r.priority === 'high').length;
    const normalPriorityRequests = requests.filter(r => r.priority === 'normal').length;
    const lowPriorityRequests = requests.filter(r => r.priority === 'low').length;
    const resolutionRate = requests.length > 0 ? ((resolvedRequests + closedRequests) / requests.length) * 100 : 0;
    const activeRequests = newRequests + inProgressRequests;

    // Statistics section
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SERVICE METRICS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    const metrics = [
      ['Total Requests', `${requests.length}`, 'Resolution Rate', `${resolutionRate.toFixed(1)}%`],
      ['Active Requests', `${activeRequests}`, 'Resolved Requests', `${resolvedRequests}`],
      ['Closed Requests', `${closedRequests}`, 'New Requests', `${newRequests}`],
      ['High Priority', `${highPriorityRequests}`, 'Normal Priority', `${normalPriorityRequests}`],
      ['Low Priority', `${lowPriorityRequests}`, 'In Progress', `${inProgressRequests}`]
    ];

    metrics.forEach(([label1, value1, label2, value2]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label1}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value1}`, 55, yPosition);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label2}:`, 110, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value2}`, 150, yPosition);
      
      yPosition += 8;
    });
    yPosition += 10;

    // Support requests table
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SUPPORT REQUESTS SUMMARY', 20, yPosition);
    yPosition += 10;

    // Create table data
    const tableData = requests.map(request => [
      request.type?.substring(0, 15) || 'N/A',
      request.name?.substring(0, 20) || 'N/A',
      request.priority || 'N/A',
      request.status || 'N/A',
      (request.category || request.reason)?.substring(0, 15) || 'N/A',
      new Date(request.createdAt).toLocaleDateString()
    ]);

    // Draw table headers manually
    this.doc.setFontSize(9);
    this.doc.setTextColor(COLORS.white);
    this.doc.setFillColor(219, 43, 46);
    this.doc.rect(20, yPosition, 170, 8, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Type', 22, yPosition + 6);
    this.doc.text('Customer', 50, yPosition + 6);
    this.doc.text('Priority', 85, yPosition + 6);
    this.doc.text('Status', 115, yPosition + 6);
    this.doc.text('Category', 145, yPosition + 6);
    this.doc.text('Date', 170, yPosition + 6);
    yPosition += 10;

    // Draw table data manually
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    tableData.slice(0, 15).forEach((row, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(20, yPosition - 2, 170, 8, 'F');
      }
      
      this.doc.text((row[0] || 'N/A').substring(0, 12), 22, yPosition + 4);
      this.doc.text((row[1] || 'N/A').substring(0, 12), 50, yPosition + 4);
      this.doc.text(row[2] || 'N/A', 85, yPosition + 4);
      this.doc.text(row[3] || 'N/A', 115, yPosition + 4);
      this.doc.text((row[4] || 'N/A').substring(0, 10), 145, yPosition + 4);
      this.doc.text(row[5] || 'N/A', 170, yPosition + 4);
      yPosition += 8;
    });

    this.addFooter(pageNumber, pageNumber);
    this.doc.save(`cadre-markets-support-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async exportDashboardPDF(dashboardData, stats) {
    this.initializePDF();
    let pageNumber = 1;
    
    await this.addHeader();
    
    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DASHBOARD ANALYTICS REPORT', 20, 50);
    
    let yPosition = 65;

    // Key Metrics Summary
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KEY BUSINESS METRICS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    // Create a clean metrics layout without autoTable
    const metrics = [
      ['Total Orders', `${stats?.totalOrders || 0}`, 'Total Revenue', `${((stats?.totalRevenue?.total || 0) / 1).toLocaleString()} EGP`],
      ['Cadre Profit', `${((stats?.totalCadreProfit?.total || 0) / 1).toLocaleString()} EGP`, 'Active Listings', `${dashboardData.activeListings || 0}`],
      ['Total Users', `${dashboardData.totalUsers || 0}`, 'Support Requests', `${dashboardData.supportRequests || 0}`],
      ['Cash Orders', `${stats?.cashOrders?.count || 0}`, 'Instapay Orders', `${stats?.visaOrders?.count || 0}`]
    ];

    // Draw metrics manually
    metrics.forEach(([label1, value1, label2, value2]) => {
      // Draw left column
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label1}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value1}`, 55, yPosition);
      
      // Draw right column
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label2}:`, 110, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value2}`, 145, yPosition);
      
      yPosition += 8;
    });
    yPosition += 10;

    // Order Status Summary
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ORDER STATUS BREAKDOWN', 20, yPosition);
    yPosition += 15;

    // Draw order status manually
    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    const orderStatuses = [
      ['Placed Orders', `${stats?.placedOrders || 0}`],
      ['Out for Delivery', `${stats?.outForDeliveryOrders || 0}`],
      ['Delivered', `${stats?.deliveredOrders || 0}`],
      ['Cancelled', `${stats?.cancelledOrders || 0}`]
    ];

    orderStatuses.forEach(([status, count]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${status}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${count}`, 70, yPosition);
      yPosition += 8;
    });

    // Add payment methods
    yPosition += 10;
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PAYMENT METHODS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    
    // Cash orders
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Cash Orders:', 20, yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Count: ${stats?.cashOrders?.count || 0}, Total: ${((stats?.cashOrders?.total || 0) / 1).toLocaleString()} EGP`, 55, yPosition);
    yPosition += 8;

    // Instapay orders
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Instapay Orders:', 20, yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Count: ${stats?.visaOrders?.count || 0}, Total: ${((stats?.visaOrders?.total || 0) / 1).toLocaleString()} EGP`, 55, yPosition);

    this.addFooter(pageNumber, pageNumber);
    this.doc.save(`cadre-markets-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async exportServicesPDF(services) {
    this.initializePDF();
    let pageNumber = 1;
    
    await this.addHeader();
    
    // Report title
    this.doc.setFontSize(16);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SERVICES ANALYTICS REPORT', 20, 50);
    
    let yPosition = 65;

    // Calculate metrics from actual services data
    const completedServices = services.filter(s => s.status === 'completed').length;
    const pendingServices = services.filter(s => s.status === 'pending').length;
    const approvedServices = services.filter(s => s.status === 'approved').length;
    const rejectedServices = services.filter(s => s.status === 'rejected').length;
    const totalRevenue = services.reduce((sum, service) => sum + (service.price || service.cost || 0), 0);
    const avgServiceValue = services.length > 0 ? totalRevenue / services.length : 0;
    const successRate = services.length > 0 ? (completedServices / services.length) * 100 : 0;
    const categories = [...new Set(services.map(s => s.type || s.category).filter(Boolean))].length;
    const activeServices = pendingServices + approvedServices;

    // Statistics section
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SERVICE METRICS', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    const metrics = [
      ['Total Services', `${services.length}`, 'Active Services', `${activeServices}`],
      ['Completed Services', `${completedServices}`, 'Pending Services', `${pendingServices}`],
      ['Approved Services', `${approvedServices}`, 'Rejected Services', `${rejectedServices}`],
      ['Total Revenue', `${totalRevenue.toLocaleString()} EGP`, 'Avg Service Value', `${avgServiceValue.toLocaleString()} EGP`],
      ['Success Rate', `${successRate.toFixed(1)}%`, 'Categories', `${categories}`]
    ];

    metrics.forEach(([label1, value1, label2, value2]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label1}:`, 20, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value1}`, 55, yPosition);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${label2}:`, 110, yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${value2}`, 150, yPosition);
      
      yPosition += 8;
    });
    yPosition += 10;

    // Services table
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SERVICES SUMMARY', 20, yPosition);
    yPosition += 10;

    // Create table data
    const tableData = services.map(service => [
      (service.name || service.title || service.reason || 'Service Request').substring(0, 20),
      service.type || service.category || 'General',
      `${(service.price || service.cost || 0).toLocaleString()} EGP`,
      service.status || 'N/A',
      (service.description || service.details || service.message || 'No description').substring(0, 20),
      new Date(service.createdAt || service.submittedAt || Date.now()).toLocaleDateString()
    ]);

    // Draw table headers manually
    this.doc.setFontSize(9);
    this.doc.setTextColor(COLORS.white);
    this.doc.setFillColor(219, 43, 46);
    this.doc.rect(20, yPosition, 170, 8, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Name', 22, yPosition + 6);
    this.doc.text('Type', 52, yPosition + 6);
    this.doc.text('Price', 77, yPosition + 6);
    this.doc.text('Status', 105, yPosition + 6);
    this.doc.text('Description', 135, yPosition + 6);
    this.doc.text('Date', 170, yPosition + 6);
    yPosition += 10;

    // Draw table data manually
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    
    tableData.slice(0, 15).forEach((row, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(20, yPosition - 2, 170, 8, 'F');
      }
      
      this.doc.text(row[0] || 'N/A', 22, yPosition + 4);
      this.doc.text(row[1] || 'N/A', 52, yPosition + 4);
      this.doc.text(row[2] || 'N/A', 77, yPosition + 4);
      this.doc.text(row[3] || 'N/A', 105, yPosition + 4);
      this.doc.text((row[4] || 'N/A').substring(0, 15), 135, yPosition + 4);
      this.doc.text(row[5] || 'N/A', 170, yPosition + 4);
      yPosition += 8;
    });

    this.addFooter(pageNumber, pageNumber);
    this.doc.save(`cadre-markets-services-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}

export default new PDFExporter(); 