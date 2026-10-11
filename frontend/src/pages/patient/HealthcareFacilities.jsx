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
    <div className="flex flex-col h-full w-full pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('healthcare_centers')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{t('facilities_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col mb-6 max-w-xl">
        {!userLocation ? (
          <div className="text-center py-2">
             <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
               <MapPin className="w-7 h-7" />
             </div>
             <p className="text-slate-600 font-medium mb-4">{t('allow_location_prompt')}</p>
             <Button onClick={handleGetLocation} disabled={locationStatus === 'loading'} className="w-full justify-center">
               {locationStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : t('find_nearby_btn')}
             </Button>
             {locationStatus === 'denied' && (
               <p className="text-rose-500 text-sm mt-3 font-medium">{t('location_denied')}</p>
             )}
          </div>
        ) : (
          <div className="text-center text-emerald-600 font-bold flex items-center justify-center gap-2 py-2">
            <MapPin className="w-5 h-5" /> {t('location_received')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {facilities.map((facility, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100/60">
                  {facility.type}
                </span>
                {facility.isEmergencyAvailable && (
                  <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-100">
                    {t('emergency_available')}
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 mt-2">{facility.name}</h3>
              <p className="text-slate-500 text-sm mt-2">{facility.address}</p>
              
              {facility.distance && (
                <p className="text-emerald-700 font-bold text-sm mt-3 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" /> {facility.distance.toFixed(1)} {t('km_away')}
                </p>
              )}
            </div>

            <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-100">
              {facility.phone && (
                <Button variant="outline" size="sm" onClick={() => handleCall(facility.phone)} className="flex items-center gap-2 flex-1 justify-center rounded-xl">
                  <Phone className="w-4 h-4" /> {t('call_btn')}
                </Button>
              )}
              {facility.latitude && facility.longitude && (
                <Button variant="primary" size="sm" onClick={() => handleNavigate(facility.latitude, facility.longitude)} className="flex items-center gap-2 flex-1 justify-center rounded-xl">
                  <MapPin className="w-4 h-4" /> {t('directions_btn')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-rose-500 text-center mt-6 font-medium">{error}</p>}
    </div>
  );
};

export default HealthcareFacilities;