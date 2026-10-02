import React from 'react';
import { Scissors, Phone, MapPin } from 'lucide-react';
import { Studio } from '../../types';
import { SpatialTilt } from '../common/SpatialTilt';

interface ShopHeaderProps {
  studio?: Studio;
  onOpenManagement: () => void;
  onOpenMap: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  studio,
  onOpenManagement,
  onOpenMap,
}) => {
  const shopPhone = studio?.phone || '۰۲۱-۲۲۳۳۴۴۵۵';

  return (
    <SpatialTilt
      as="div"
      id="shop-presence-header" 
      maxTilt={5}
      glareOpacity={0.25}
      scaleOnHover={1.01}
      className="apple-glass-card rounded-[26px] p-3.5 mb-3 text-stone-900"
    >
      <div className="flex items-center justify-between">
        {/* Shop Brand & Name */}
        <div className="flex items-center gap-2.5">
          <SpatialTilt
            as="button"
            id="manager-panel-scissor-button"
            maxTilt={12}
            glareOpacity={0.4}
            scaleOnHover={1.08}
            onClick={onOpenManagement}
            title="ورود به پنل مدیریت آرایشگاه"
            aria-label="ورود به پنل مدیریت آرایشگاه"
            className="group/scissor relative w-10 h-10 rounded-2xl apple-3d-tile text-[#0f172a] hover:text-[#bf5938] hover:border-[#f3d0c4] hover:bg-[#fdf2ee] flex items-center justify-center cursor-pointer"
          >
            <Scissors
              style={{
                paddingLeft: '0px',
                marginLeft: '0px',
                marginTop: '9px',
                marginBottom: '0px',
                marginRight: '9px',
              }}
              className="w-5 h-5 transition-transform duration-200 group-hover/scissor:rotate-45 group-hover/scissor:scale-110"
            />
          </SpatialTilt>
          <div>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">
              {studio?.name || 'آرایشگاه رویال'}
            </h1>
            {/* Live Hours Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-200" />
              <span className="text-[10px] font-medium text-stone-600">
                امروز باز است · تا ساعت ۲۲:۰۰
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Map Actions */}
        <div className="flex items-center gap-2">
          <a
            id="home-quick-call-btn"
            href={`tel:${shopPhone.replace(/\D/g, '')}`}
            className="w-8 h-8 rounded-full apple-3d-tile text-stone-700 hover:text-blue-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            title={`تماس با آرایشگاه: ${shopPhone}`}
          >
            <Phone className="w-3.5 h-3.5" />
          </a>

          <button
            id="home-quick-map-btn"
            type="button"
            onClick={onOpenMap}
            className="w-8 h-8 rounded-full apple-3d-tile text-stone-700 hover:text-rose-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="مشاهده آدرس و مسیریابی"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </SpatialTilt>
  );
};

