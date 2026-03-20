import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/login');
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    allBookings,
    thisMonthBookings,
    lastMonthBookings,
    pendingReviews,
    allReviews,
    recentActivity,
  ] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.booking.findMany({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.findMany({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.review.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  // Revenue calculations
  const totalRevenue = allBookings.reduce((s, b) => s + (b.depositAmount || 0), 0);
  const thisMonthRevenue = thisMonthBookings.reduce((s, b) => s + (b.depositAmount || 0), 0);
  const lastMonthRevenue = lastMonthBookings.reduce((s, b) => s + (b.depositAmount || 0), 0);
  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  // Status counts
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
  const pending = allBookings.filter(b => b.status === 'pending-payment' || b.status === 'pending').length;
  const completed = allBookings.filter(b => b.status === 'completed').length;
  const pendingDepositAmount = allBookings
    .filter(b => b.paymentStatus === 'unpaid')
    .reduce((s, b) => s + (b.depositAmount || 0), 0);

  // Avg order value
  const paidBookings = allBookings.filter(b => b.paymentStatus === 'paid');
  const avgOrderValue = paidBookings.length > 0
    ? Math.round(paidBookings.reduce((s, b) => s + (b.packagePrice || 0), 0) / paidBookings.length)
    : 0;

  // Top package this month
  const pkgCount: Record<string, number> = {};
  thisMonthBookings.forEach(b => { pkgCount[b.package] = (pkgCount[b.package] || 0) + 1; });
  const topPackage = Object.entries(pkgCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Monthly revenue for chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
    const monthBookings = allBookings.filter(b => {
      const c = new Date(b.createdAt);
      return c >= d && c <= end;
    });
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      revenue: monthBookings.reduce((s, b) => s + (b.depositAmount || 0), 0),
      bookings: monthBookings.length,
    };
  });

  // Package popularity
  const allPkgCount: Record<string, number> = {};
  allBookings.forEach(b => { allPkgCount[b.package] = (allPkgCount[b.package] || 0) + 1; });
  const packageStats = Object.entries(allPkgCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Avg rating
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '0.0';

  // Booked dates for calendar
  const bookedDates = allBookings.map(b => b.eventDate);

  return (
    <DashboardClient
      stats={{
        totalBookings: allBookings.length,
        thisMonthBookings: thisMonthBookings.length,
        confirmed,
        pending,
        completed,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
        pendingDepositAmount,
        avgOrderValue,
        topPackage,
        avgRating,
        totalReviews: allReviews.length,
        pendingReviewsCount: pendingReviews.length,
      }}
      monthlyData={monthlyData}
      packageStats={packageStats}
      recentBookings={recentActivity}
      pendingReviews={pendingReviews}
      bookedDates={bookedDates}
    />
  );
}
