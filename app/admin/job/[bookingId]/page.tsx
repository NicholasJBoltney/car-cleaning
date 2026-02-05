'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Badge, Textarea, Input } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import { uploadBase64Image } from '@/lib/cloudinary';
import type { Booking, ServiceHistory } from '@/types';

export default function JobCapturePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Photo states
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [uploadedBeforeUrls, setUploadedBeforeUrls] = useState<string[]>([]);
  const [uploadedAfterUrls, setUploadedAfterUrls] = useState<string[]>([]);

  // Form states
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [paintCondition, setPaintCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [swirlMarksDetected, setSwirlMarksDetected] = useState(false);
  const [scratchesDetected, setScratchesDetected] = useState(false);
  const [treatmentsApplied, setTreatmentsApplied] = useState<string[]>(['pH-neutral wash', 'Polymer sealant']);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          slot:slots(*),
          user_profile:user_profiles(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null, type: 'before' | 'after') => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'before') {
          setBeforePhotos((prev) => [...prev, base64]);
        } else {
          setAfterPhotos((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPhotos = async (): Promise<{ before: string[]; after: string[] }> => {
    const uploadedBefore: string[] = [];
    const uploadedAfter: string[] = [];

    setUploading(true);

    try {
      // Upload before photos
      for (const photo of beforePhotos) {
        if (!uploadedBeforeUrls.includes(photo)) {
          const result = await uploadBase64Image(photo, `bookings/${bookingId}/before`);
          uploadedBefore.push(result.secure_url);
        }
      }

      // Upload after photos
      for (const photo of afterPhotos) {
        if (!uploadedAfterUrls.includes(photo)) {
          const result = await uploadBase64Image(photo, `bookings/${bookingId}/after`);
          uploadedAfter.push(result.secure_url);
        }
      }

      setUploadedBeforeUrls([...uploadedBeforeUrls, ...uploadedBefore]);
      setUploadedAfterUrls([...uploadedAfterUrls, ...uploadedAfter]);

      return {
        before: [...uploadedBeforeUrls, ...uploadedBefore],
        after: [...uploadedAfterUrls, ...uploadedAfter],
      };
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      alert('Please capture both before and after photos');
      return;
    }

    setUploading(true);

    try {
      // Upload all photos
      const photoUrls = await uploadPhotos();

      // Create service history record
      const { data: historyData, error: historyError } = await supabase
        .from('service_history')
        .insert({
          booking_id: bookingId,
          before_photos: photoUrls.before,
          after_photos: photoUrls.after,
          technician_notes: technicianNotes,
          paint_condition: paintCondition,
          swirl_marks_detected: swirlMarksDetected,
          scratches_detected: scratchesDetected,
          treatments_applied: treatmentsApplied,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Update booking status to completed
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // TODO: Trigger PDF generation and SMS notification
      alert('Service completed successfully! PDF report will be generated.');
      router.push('/admin');
    } catch (error) {
      console.error('Error completing service:', error);
      alert('Failed to complete service. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleTreatment = (treatment: string) => {
    setTreatmentsApplied((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-titanium-silver opacity-70">Loading job details...</p>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-titanium-silver opacity-70">Booking not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-titanium-silver mb-2">
            <span className="text-gradient">Photo Capture</span>
          </h1>
          <p className="text-titanium-silver opacity-70">
            {booking.vehicle?.brand} {booking.vehicle?.model} - {booking.vehicle?.license_plate}
          </p>
        </div>

        {/* Client Info */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-titanium-silver opacity-60 mb-1">Client</p>
              <p className="text-titanium-silver font-semibold">
                {booking.user_profile?.first_name} {booking.user_profile?.last_name}
              </p>
            </div>
            <div>
              <p className="text-titanium-silver opacity-60 mb-1">Location</p>
              <p className="text-titanium-silver">{booking.suburb}, {booking.city}</p>
            </div>
          </div>
        </Card>

        {/* Before Photos */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-titanium-silver mb-4">Before Photos</h3>
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files, 'before')}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {beforePhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-slate-grey rounded-lg overflow-hidden">
                <img src={photo} alt={`Before ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(index, 'before')}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => beforeInputRef.current?.click()}
          >
            📷 Add Before Photos
          </Button>
        </Card>

        {/* After Photos */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-titanium-silver mb-4">After Photos</h3>
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files, 'after')}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {afterPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-slate-grey rounded-lg overflow-hidden">
                <img src={photo} alt={`After ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(index, 'after')}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => afterInputRef.current?.click()}
          >
            📷 Add After Photos
          </Button>
        </Card>

        {/* Condition Assessment */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-titanium-silver mb-4">Condition Assessment</h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-titanium-silver mb-2">
                Paint Condition
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['excellent', 'good', 'fair', 'poor'] as const).map((condition) => (
                  <button
                    key={condition}
                    onClick={() => setPaintCondition(condition)}
                    className={`p-3 rounded-lg border-2 capitalize transition-all ${
                      paintCondition === condition
                        ? 'border-electric-cyan bg-electric-cyan/20'
                        : 'border-slate-grey bg-slate-grey/50'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={swirlMarksDetected}
                  onChange={(e) => setSwirlMarksDetected(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-titanium-silver">Swirl marks detected</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scratchesDetected}
                  onChange={(e) => setScratchesDetected(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-titanium-silver">Scratches detected</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-titanium-silver mb-2">
              Treatments Applied
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'pH-neutral wash',
                'Polymer sealant',
                'Si02 coating',
                'Wheel detail',
                'Glass treatment',
                'Trim restoration',
                'Interior vacuum',
                'Leather conditioning',
              ].map((treatment) => (
                <button
                  key={treatment}
                  onClick={() => toggleTreatment(treatment)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    treatmentsApplied.includes(treatment)
                      ? 'bg-electric-cyan text-void-black'
                      : 'bg-slate-grey text-titanium-silver'
                  }`}
                >
                  {treatment}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Technician Notes"
            placeholder="Any special observations, issues found, or recommendations for the client..."
            value={technicianNotes}
            onChange={(e) => setTechnicianNotes(e.target.value)}
          />
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => router.push('/admin')}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            fullWidth
            onClick={handleComplete}
            loading={uploading}
            disabled={beforePhotos.length === 0 || afterPhotos.length === 0}
          >
            {uploading ? 'Uploading...' : 'Complete Service'}
          </Button>
        </div>
      </div>
    </div>
  );
}
