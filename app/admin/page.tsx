'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import type { Booking } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // TODO: Add admin role check
    fetchUpcomingBookings();
  };

  const fetchUpcomingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          slot:slots(*),
          user_profile:user_profiles(*)
        `)
        .in('status', ['confirmed', 'in_progress'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBookings(data || []);

      // Set to next Saturday by default
      const nextSaturday = getNextSaturday();
      setSelectedDate(nextSaturday.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextSaturday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
    return nextSaturday;
  };

  const filteredBookings = bookings.filter(
    (booking) => booking.slot?.saturday_date === selectedDate
  );

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      fetchUpcomingBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-titanium-silver opacity-70">Loading run sheet...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-titanium-silver mb-2">
            <span className="text-gradient">Technician Terminal</span>
          </h1>
          <p className="text-titanium-silver opacity-70">
            Saturday run sheet and job management
          </p>
        </div>

        {/* Date Selector */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-titanium-silver mb-2">
                Select Saturday
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-grey border border-[rgba(230,232,238,0.1)] text-titanium-silver px-4 py-3 rounded-lg focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-titanium-silver opacity-60 mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-electric-cyan">{filteredBookings.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-titanium-silver opacity-60 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-electric-cyan">
                  R{filteredBookings.reduce((sum, b) => sum + b.grand_total, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-titanium-silver opacity-70">No bookings for this date</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Side - Job Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-electric-cyan/20 rounded-full flex items-center justify-center font-bold text-electric-cyan">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-titanium-silver">
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </h3>
                        <p className="text-sm text-titanium-silver opacity-70">
                          {booking.vehicle?.license_plate} | {booking.slot?.time_slot.substring(0, 5)}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'info' : 'warning'}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-titanium-silver opacity-60 mb-1">Client</p>
                        <p className="text-titanium-silver font-semibold">
                          {booking.user_profile?.first_name} {booking.user_profile?.last_name}
                        </p>
                        <p className="text-titanium-silver opacity-80">{booking.user_profile?.phone}</p>
                      </div>

                      <div>
                        <p className="text-titanium-silver opacity-60 mb-1">Location</p>
                        <p className="text-titanium-silver">{booking.address}</p>
                        <p className="text-titanium-silver opacity-80">
                          {booking.suburb}, {booking.city}
                        </p>
                      </div>

                      {booking.gate_access_notes && (
                        <div className="md:col-span-2">
                          <p className="text-titanium-silver opacity-60 mb-1">Gate Access</p>
                          <p className="text-titanium-silver text-sm bg-slate-grey/50 p-2 rounded">
                            {booking.gate_access_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="text-center mb-2">
                      <p className="text-sm text-titanium-silver opacity-60 mb-1">Service Value</p>
                      <p className="text-2xl font-bold text-electric-cyan">
                        R{booking.grand_total.toFixed(2)}
                      </p>
                    </div>

                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                      >
                        Start Job
                      </Button>
                    )}

                    {booking.status === 'in_progress' && (
                      <>
                        <Link href={`/admin/job/${booking.id}`}>
                          <Button size="sm" fullWidth>
                            Capture Photos
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}

                    <Button variant="ghost" size="sm" fullWidth>
                      <a href={`tel:${booking.user_profile?.phone}`}>Call Client</a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
