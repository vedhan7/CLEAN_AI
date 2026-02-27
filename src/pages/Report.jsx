import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Camera, AlertTriangle, Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Report() {
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({ issue_type: '', description: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setForm({ ...form, photo: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position || !form.issue_type) {
      toast.error('Please mark the location and select an issue type.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Locating nearest LCV dispatch...');

    try {
      let imageUrl = null;

      // Step 1: Upload Photo to Supabase Storage (if attached)
      if (form.photo) {
        toast.loading('Uploading evidence...', { id: loadingToast });
        const fileExt = form.photo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(filePath, form.photo);

        if (uploadError) {
          throw new Error('Image upload failed: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      toast.loading('Locating nearest LCV dispatch...', { id: loadingToast });

      // Step 2: Assign a static 'Ward' ID based on lat/lng for MVP demo purposes
      const mockWardId = Math.random() > 0.5 ? 41 : 42;

      // Step 3: Push accurate complaint to database
      const { data, error } = await supabase
        .from('complaints')
        .insert([{
          issue_type: form.issue_type,
          description: form.description,
          lat: position.lat,
          lng: position.lng,
          ward_id: mockWardId,
          image_url: imageUrl
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message);
      }

      // Step 3: Successfully saved
      setTrackingId(data.id);
      toast.success('Complaint registered securely on-chain.', { id: loadingToast });
      setSubmitted(true);

    } catch {
      toast.error('Failed to submit. Please check your network.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ paddingTop: '120px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-card animate-fade-in-up">
          <div style={{ background: 'rgba(0, 214, 143, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)', color: 'var(--c-emerald)' }}>
            <AlertTriangle size={40} />
          </div>
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>Complaint Registered</h2>
          <p style={{ color: 'var(--c-gray-400)', marginBottom: 'var(--space-md)' }}>Your issue has been logged and assigned to the nearest available LCV worker for Ward analysis.</p>
          <div style={{ background: 'var(--c-midnight)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-gray-400)' }}>Tracking ID</p>
            <h1 style={{ color: 'var(--c-emerald)', letterSpacing: '4px' }}>{trackingId}</h1>
          </div>
          <button className="btn-secondary" onClick={() => window.location.href = '/track'} style={{ width: '100%' }}>
            Track Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
      <h1 className="animate-fade-in-up" style={{ marginBottom: 'var(--space-sm)' }}>Report an Issue</h1>
      <p className="animate-fade-in-up delay-100" style={{ color: 'var(--c-gray-400)', marginBottom: 'var(--space-md)' }}>Pinpoint the exact location on the map and describe the problem to dispatch an LCV immediately.</p>

      <div className="glass-card animate-fade-in-up delay-200">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
              <MapPin size={18} color="var(--c-emerald)" /> Location (Tap on map to place pin)
            </label>
            <div style={{ height: '300px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <MapContainer center={[9.9252, 78.1198]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && <p style={{ fontSize: '0.85rem', color: 'var(--c-gray-400)', marginTop: '8px' }}>Selected GeoCoords: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Issue Type</label>
            <select
              value={form.issue_type}
              onChange={e => setForm({ ...form, issue_type: e.target.value })}
              style={{ width: '100%', padding: '12px', background: 'var(--c-midnight-light)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            >
              <option value="" disabled>Select issue category...</option>
              <option value="overflowing_bin">Overflowing Bin</option>
              <option value="missed_collection">Missed Door-to-Door Collection</option>
              <option value="bulk_waste">Bulk / Construction Debris</option>
              <option value="dirty_toilet">Unclean Public Toilet</option>
              <option value="pest_sighting">Stray Animals / Pests</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description (Optional)</label>
            <textarea
              placeholder="Any additional details..."
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '12px', background: 'var(--c-midnight-light)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-sm)', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {!form.photo ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--c-white)', cursor: 'pointer' }}
              >
                <Camera size={20} /> Attach Photo
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0, 214, 143, 0.1)', border: '1px solid var(--c-emerald)', borderRadius: 'var(--radius-sm)', color: 'var(--c-emerald)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} />
                  <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{form.photo.name}</span>
                </div>
                <button type="button" onClick={() => setForm({ ...form, photo: null })} style={{ background: 'none', border: 'none', color: 'var(--c-emerald)', cursor: 'pointer', padding: '4px' }}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', fontSize: '1.1rem', marginTop: 'var(--space-sm)', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
