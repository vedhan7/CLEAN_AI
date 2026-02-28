import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, GeoJSON } from 'react-leaflet';
import { Camera, MapPin as MapPinIcon, Send, ArrowRight, Loader2, Navigation, Crosshair, X, Image as ImageIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import councillorData from '../data/councillors.json';
import { useAuth } from '../hooks/useAuth';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ray-casting algorithm to determine if a point is inside a polygon
function pointInPolygon(point, vs) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position && position.fromGPS) {
            map.flyTo(position, 16);
        }
    }, [position, map]);

    return position === null ? null : <Marker position={position}></Marker>;
}

const Report = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [position, setPosition] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        photo: null,
    });

    const [geoData, setGeoData] = useState(null);
    const [matchedWard, setMatchedWard] = useState(null);
    const [matchedCouncillor, setMatchedCouncillor] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetch('/madurai-wards.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load geojson', err));
    }, []);

    useEffect(() => {
        if (!position || !geoData) return;

        const pt = [position.lng, position.lat];
        let foundWardId = null;
        let closestWardId = null;
        let minDistance = Infinity;

        for (const feature of geoData.features) {
            if (feature.geometry && feature.geometry.coordinates) {
                const polyCoords = feature.geometry.coordinates[0];
                if (pointInPolygon(pt, polyCoords)) {
                    foundWardId = feature.properties.id;
                    break;
                }

                const firstPt = polyCoords[0];
                const dist = Math.pow(pt[0] - firstPt[0], 2) + Math.pow(pt[1] - firstPt[1], 2);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestWardId = feature.properties.id;
                }
            }
        }

        const targetWard = foundWardId || closestWardId;
        if (targetWard) {
            setMatchedWard(targetWard);
            setMatchedCouncillor(councillorData.find(c => c.id === targetWard) || null);
        } else {
            setMatchedWard(null);
            setMatchedCouncillor(null);
        }
    }, [position, geoData]);

    const onEachWard = (feature, layer) => {
        layer.on({
            click: (e) => {
                const wardId = feature.properties.id;
                setMatchedWard(wardId);
                setMatchedCouncillor(councillorData.find(c => c.id === wardId) || null);
                setPosition({ lat: e.latlng.lat, lng: e.latlng.lng, fromGPS: false });
            },
            mouseover: (e) => e.target.setStyle({ weight: 3, color: 'var(--c-emerald)', fillOpacity: 0.1 }),
            mouseout: (e) => e.target.setStyle({ weight: 1, color: 'rgba(0,0,0,0)', fillOpacity: 0 })
        });
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        const loadingToast = toast.loading('Acquiring GPS signal...');

        navigator.geolocation.getCurrentPosition(
            (loc) => {
                setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude, fromGPS: true });
                toast.success('Location pinpointed!', { id: loadingToast });
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                toast.error('Failed to get location: ' + err.message, { id: loadingToast });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const nextStep = () => {
        if (step === 1 && !position) {
            toast.error("Please drop a pin on the map or use your GPS location.");
            return;
        }
        if (step === 2 && !formData.type) {
            toast.error("Please select an issue type.");
            return;
        }
        setStep(s => Math.min(s + 1, 3));
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be smaller than 5MB");
                return;
            }
            setFormData({ ...formData, photo: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Filing complaint to Madurai City Corporation...');

        try {
            let imageUrl = null;
            if (formData.photo) {
                toast.loading('Uploading photo evidence...', { id: loadingToast });
                const fileExt = formData.photo.name.split('.').pop();
                const filePath = `${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('complaint-images')
                    .upload(filePath, formData.photo);

                if (uploadError) throw new Error('Image upload failed');

                const { data: { publicUrl } } = supabase.storage
                    .from('complaint-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            toast.loading('Dispatching to AI triage...', { id: loadingToast });

            const { data, error } = await supabase.from('complaints').insert([{
                user_id: user?.id || null,
                type: formData.type,
                description: formData.description,
                latitude: position.lat,
                longitude: position.lng,
                ward_id: matchedWard || null,
                photo_urls: imageUrl ? [imageUrl] : [],
            }]).select('*').single();

            if (error) throw new Error(error.message);

            toast.success('Complaint submitted! AI is triaging priority.', { id: loadingToast, duration: 4000 });
            setTimeout(() => window.location.href = `/track?id=${data.id}`, 2000);
        } catch (err) {
            toast.error(err.message || 'Submission failed.', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-8 pl-1">
                <h1 className="font-display font-bold text-4xl mb-2">Report an Issue</h1>
                <p className="text-[var(--c-gray-400)]">Help keep Madurai clean by reporting sanitation issues.</p>
            </div>

            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-[var(--c-emerald)]' : 'bg-white/10'}`} />
                ))}
            </div>

            <GlassCard className="p-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-medium">Where is the issue?</h2>
                            <Button variant="ghost" className="text-sm border border-[var(--c-emerald)] text-[var(--c-emerald)]" onClick={handleDetectLocation} disabled={isLocating}>
                                {isLocating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Crosshair size={16} className="mr-2" />}
                                GPS Locate
                            </Button>
                        </div>

                        <div className="bg-white/5 h-[400px] rounded-xl overflow-hidden border border-[var(--glass-border)]">
                            <MapContainer center={[9.9252, 78.1198]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                {geoData && <GeoJSON data={geoData} onEachFeature={onEachWard} style={{ weight: 1, color: 'rgba(0,0,0,0)', fillOpacity: 0 }} />}
                                <LocationMarker position={position} setPosition={setPosition} />
                            </MapContainer>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[var(--c-gray-300)] text-sm">{position ? `Selected Coordinates: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'Click on the map to pin point the location.'}</span>
                            {matchedCouncillor && (
                                <div className="bg-[var(--c-emerald)]/10 text-[var(--c-emerald)] p-3 rounded-lg border border-[var(--c-emerald)]/30 text-sm">
                                    <strong>Ward {matchedWard} detected:</strong> Assigned to Councillor {matchedCouncillor.councillor_name} ({matchedCouncillor.councillor_party})
                                </div>
                            )}
                        </div>

                        <Button className="w-full py-4 text-lg" onClick={nextStep}>
                            Confirm Location
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <h2 className="text-2xl font-medium">Issue Details</h2>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-[var(--c-gray-300)] mb-2 block">Issue Type</span>
                                <select
                                    className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--c-emerald)]"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="">Select an issue type...</option>
                                    <option value="overflowing_bin">Overflowing Bin</option>
                                    <option value="bulk_waste">Bulk Waste Dumping</option>
                                    <option value="missed_collection">Missed Collection</option>
                                    <option value="dirty_toilet">Dirty Public Toilet</option>
                                    <option value="dead_animal">Dead Animal</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-[var(--c-gray-300)] mb-2 block">Description (Optional)</span>
                                <textarea
                                    rows="4"
                                    className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--c-emerald)]"
                                    placeholder="Additional details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </label>

                            <div>
                                <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
                                {!formData.photo ? (
                                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[var(--glass-border)] rounded-xl p-8 text-center hover:border-[var(--c-emerald)] transition-colors cursor-pointer bg-white/5">
                                        <Camera className="mx-auto mb-4 text-[var(--c-gray-400)]" size={32} />
                                        <p className="text-[var(--c-gray-300)]">Tap to upload a photo</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-[var(--c-emerald)]/10 border border-[var(--c-emerald)]/30 rounded-xl text-[var(--c-emerald)]">
                                        <div className="flex items-center gap-3">
                                            <ImageIcon size={24} />
                                            <span className="text-sm font-medium truncate max-w-[200px]">{formData.photo.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setFormData({ ...formData, photo: null })} className="p-1 hover:bg-[var(--c-emerald)]/20 rounded-full">
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                            <Button onClick={nextStep} className="flex-1">
                                Next <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <h2 className="text-2xl font-medium">Review & Submit</h2>

                        <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-[var(--glass-border)]">
                            <div className="flex justify-between border-b border-[var(--glass-border)] pb-4">
                                <span className="text-[var(--c-gray-400)]">Location</span>
                                <span className="font-medium text-right max-w-[200px]">
                                    {matchedWard ? `Ward ${matchedWard}` : `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--glass-border)] pb-4">
                                <span className="text-[var(--c-gray-400)]">Issue Type</span>
                                <span className="font-medium capitalize">{formData.type.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-[var(--c-gray-400)] block mb-2">Description</span>
                                <p className="text-sm">{formData.description || 'No description provided.'}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
                            <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[var(--c-emerald)] to-cyan-500 hover:scale-[1.02] border-none text-[var(--c-midnight)]">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto text-[var(--c-midnight)]" size={24} /> : <span className="flex items-center justify-center">Submit Complaint <Send className="ml-2" size={18} /></span>}
                            </Button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default Report;
