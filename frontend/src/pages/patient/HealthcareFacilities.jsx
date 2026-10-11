import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Loader2, Navigation } from 'lucide-react';
import Button from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';

const HealthcareFacilities = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(''); // '', 'loading', 'denied'

  const fetchFacilities = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/facilities');
      const data = await res.json();
      if (data.success) {
        setFacilities(data.data);
      }
    } catch (err) {
      setError(t('error_facilities'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleGetLocation = () => {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationStatus('');
          
          // Sort facilities
          setFacilities(prev => {
            const sorted = [...prev].map(f => {
              if (f.latitude && f.longitude) {
                f.distance = calculateDistance(latitude, longitude, f.latitude, f.longitude);
              }
              return f;
            }).sort((a, b) => {
              if (a.distance && b.distance) return a.distance - b.distance;
              return 0;
            });
            return sorted;
          });
        },
        (err) => {
          console.error(err);
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  const handleCall = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleNavigate = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-text">{t('healthcare_centers')}</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col mb-4">
        {!userLocation ? (
          <div className="text-center">
             <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-3" />
             <p className="text-neutral-muted mb-4">{t('allow_location_prompt')}</p>
             <Button onClick={handleGetLocation} disabled={locationStatus === 'loading'} className="w-full justify-center">
               {locationStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : t('find_nearby_btn')}
             </Button>
             {locationStatus === 'denied' && (
               <p className="text-red-500 text-sm mt-3">{t('location_denied')}</p>
             )}
          </div>
        ) : (
          <div className="text-center text-green-600 font-bold flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" /> {t('location_received')}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {facilities.map((facility, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
            {facility.isEmergencyAvailable && (
              <span className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
                {t('emergency_available')}
              </span>
            )}
            
            <h3 className="font-bold text-lg text-neutral-text pr-24">{facility.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">{facility.type}</span>
            
            <p className="text-neutral-muted text-sm mt-2">{facility.address}</p>
            
            {facility.distance && (
              <p className="text-green-600 font-bold text-sm mt-2 flex items-center gap-1">
                <Navigation className="w-4 h-4" /> {facility.distance.toFixed(1)} {t('km_away')}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {facility.phone && (
                <Button variant="outline" size="sm" onClick={() => handleCall(facility.phone)} className="flex items-center gap-2 flex-1 justify-center">
                  <Phone className="w-4 h-4" /> {t('call_btn')}
                </Button>
              )}
              {facility.latitude && facility.longitude && (
                <Button variant="primary" size="sm" onClick={() => handleNavigate(facility.latitude, facility.longitude)} className="flex items-center gap-2 flex-1 justify-center">
                  <MapPin className="w-4 h-4" /> {t('directions_btn')}
                </Button>
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default HealthcareFacilities;