"use client"
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'chart.js/auto';


export default function Section() {
  const statsChartRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    sales: 0,
    revenue: 0,
    completed: 0,
    cancelled: 0,
    products: 0,
    recentOrders: []
  });
  const [chartType, setChartType] = useState('overview');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const userIcon = "/assets/img/user.png";
  const boxIcon = "/assets/img/boxes.png";
  console.log(baseUrl)
    useEffect(() => {
  
    fetchStats();
  
    }, []);

const fetchStats = async () => {
  const token = localStorage.getItem('adminToken'); // get token here
  if (!token) {
    window.location.href = '/signin';
    return;
  } 
    try {
      const response = await fetch(`${baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log(data);
      
      if (data.success) {
        setStats({
          customers: data.userCount,
          orders: data.orderCount,
          sales: data.totalSales || 0,
          revenue: data.totalRevenue || 0,
          completed: data.status.delivered,
          cancelled: data.status.cancelled,
          products: data.productCount,
          recentOrders: data.recentOrders || []
        });
      } else {
        toast.error('Failed to load statistics');
      }
    } catch (error) {
      toast.error('Network error loading dashboard');
    }
  };

  useEffect(() => {
    if (chartCanvasRef.current) {
      initChart();
    }

    return () => {
      if (statsChartRef.current) {
        statsChartRef.current.destroy();
      }
    };
  }, [chartType]);

  const initChart = () => {
    if (!chartCanvasRef.current) return;

    const ctx = chartCanvasRef.current.getContext('2d');
    
    if (statsChartRef.current) {
      statsChartRef.current.destroy();
    }

    const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient1.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient1.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, 'rgba(147, 197, 253, 0.3)');
    gradient2.addColorStop(1, 'rgba(147, 197, 253, 0)');

    const gradient3 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient3.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
    gradient3.addColorStop(1, 'rgba(249, 115, 22, 0)');

    // Different data based on chart type
    let chartData = {};
    
    switch(chartType) {
      case 'sales':
        chartData = {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [
            { 
              label: 'Sales Target', 
              data: [150, 170, 190, 210, 230, 250], 
              fill: true, 
              backgroundColor: gradient1, 
              borderColor: '#6366f1', 
              tension: 0.4, 
              pointRadius: 0 
            },
            { 
              label: 'Actual Sales', 
              data: [120, 145, 180, 195, 220, 240], 
              fill: true, 
              backgroundColor: gradient2, 
              borderColor: '#93c5fd', 
              tension: 0.4, 
              pointRadius: 0 
            }
          ]
        };
        break;
      
      case 'revenue':
        chartData = {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [
            { 
              label: 'Revenue Target', 
              data: [50000, 55000, 60000, 65000, 70000, 75000], 
              fill: true, 
              backgroundColor: gradient1, 
              borderColor: '#6366f1', 
              tension: 0.4, 
              pointRadius: 0 
            },
            { 
              label: 'Actual Revenue', 
              data: [45000, 52000, 58000, 62000, 68000, 72000], 
              fill: true, 
              backgroundColor: gradient3, 
              borderColor: '#f97316', 
              tension: 0.4, 
              pointRadius: 0 
            }
          ]
        };
        break;
      
      default: // overview
        chartData = {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [
            { 
              label: 'Sales', 
              data: [120, 145, 180, 195, 220, 240], 
              fill: true, 
              backgroundColor: gradient1, 
              borderColor: '#6366f1', 
              tension: 0.4, 
              pointRadius: 0 
            },
            { 
              label: 'Revenue', 
              data: [45000, 52000, 58000, 62000, 68000, 72000], 
              fill: true, 
              backgroundColor: gradient2, 
              borderColor: '#93c5fd', 
              tension: 0.4, 
              pointRadius: 0,
              yAxisID: 'y1'
            }
          ]
        };
    }

    statsChartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: chartType === 'overview',
            position: 'top'
          } 
        },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { color: '#9ca3af' }, 
            grid: { color: '#f3f4f6' },
            display: chartType !== 'revenue'
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            ticks: { color: '#9ca3af' },
            grid: { display: false },
            display: chartType === 'overview'
          },
          x: { 
            ticks: { color: '#6b7280' }, 
            grid: { display: false } 
          },
        },
      },
    });
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className="bg-[#ebebeb] text-white flex-1 p-2 min-h-screen overflow-auto sm:mt-0 mt-[60px] w-full">
      <div className="flex flex-col justify-center gap-2">
        
        {/* Stats Cards */}
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Customers Card */}
          <div className="flex flex-col justify-between p-4 text-black bg-white rounded-lg">
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-14 w-14">
              <img className="h-6" src={userIcon} alt="Customers" />
            </div>
            <div className="font-semibold text-gray-500">Customers</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.customers}</div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="flex flex-col justify-between p-4 text-black bg-white rounded-lg" >
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-14 w-14">
              <img className="h-6" src={boxIcon} alt="Orders" />
            </div>
            <div className="font-semibold text-gray-500">Orders</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.orders}</div>
            </div>
          </div>

          {/* Sales Card */}
          <div className="flex flex-col justify-between p-4 text-black bg-white rounded-lg">
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-14 w-14">
              <img className="h-6" src={boxIcon} alt="Sales" />
            </div>
            <div className="font-semibold text-gray-500">Sales</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.sales}</div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="flex flex-col justify-between p-4 text-black bg-white rounded-lg">
            <div className="flex items-center justify-center bg-gray-200 rounded-lg h-14 w-14">
              <img className="h-6" src={boxIcon} alt="Revenue" />
            </div>
            <div className="font-semibold text-gray-500">Revenue</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">₹{stats.revenue}</div>
            </div>
          </div>
        </div>

        {/* Statistics Chart Section */}
        <div className="text-black bg-white rounded-xl shadow p-6 flex flex-col justify-center items-center min-h-[300px]">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
              <p className="text-sm text-gray-500">Target you've set for each month</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-1 text-sm font-medium rounded-full ${
                  chartType === 'overview' ? 'bg-gray-200' : 'text-gray-500'
                }`}
                onClick={() => handleChartTypeChange('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full ${
                  chartType === 'sales' ? 'bg-gray-200' : 'text-gray-500'
                }`}
                onClick={() => handleChartTypeChange('sales')}
              >
                Sales
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full ${
                  chartType === 'revenue' ? 'bg-gray-200' : 'text-gray-500'
                }`}
                onClick={() => handleChartTypeChange('revenue')}
              >
                Revenue
              </button>
              <button className="p-2 text-sm rounded">📅</button>
            </div>
          </div>
          <div className="w-[80%] flex justify-center" style={{ height: '250px' }}>
            <canvas 
              ref={chartCanvasRef} 
              id="statsChart" 
              className="w-full"
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-wrap gap-2">
          {/* Demographics Section */}
          {/* <div className="bg-white p-4 rounded-lg text-black w-[100%] lg:w-[49.5%]">
            <h2 className="text-base font-semibold text-gray-800">Customers Demographic</h2>
            <p className="mb-4 text-xs text-gray-500">Number of customer based on country</p>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png"
              alt="World Map"
              className="object-cover w-full mb-4 rounded-lg"
            />
          </div> */}

          {/* Recent Orders Section */}
          <div className="bg-white p-4 rounded-lg text-black w-[100%] lg:w-[49.5%]">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3">
                        <div className="text-xs font-medium text-gray-600">
                          {/* {order.id.substring(0, 8)}... */}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">
                          {order.user?.fullName || 'Guest User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">
                          ₹{order.total?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}