import { 
  STUDIO_SEED,
  CHAIRS_SEED,
  BARBERS_SEED,
  CUSTOMERS_SEED,
  DEFAULT_CLIENT_PROFILE,
  SERVICES_SEED,
  ACCOUTREMENTS_SEED,
  BEVERAGE_OPTIONS_SEED,
  INITIAL_APPOINTMENT,
  TODAY_APPOINTMENTS_SEED,
  PAST_APPOINTMENTS_SEED,
  PRODUCTS_SEED,
  ORDERS_SEED,
  NOTIFICATIONS_SEED
} from './seedData';
import { Service, Accoutrement, BeverageOption, Reservation, ClientProfile } from '../types';

export const ATELIER_IMAGES = {
  // Bronze shears and razor balanced on a sculptural smooth travertine stone pedestal
  shearsTravertine: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5IYqg9-RNpIB-YyQKFpJO4zzbrDPUvDUsbu3a37tlFscXOzSfrctrax5DTLmCb1wVh7jTdHxJXHtEZF9eNhlh06qsTaqfhEZdvt56b4Eagtd5KzFpylWQPk4osN2Q8EpAPzlniyz0dn8IhPvhAalMVLfijXCixL4FWG1vC9rcTpPCG3DOKZzRjwJyLcNpQFlsIvYBr8w3tjOofkidMmSyGfmSa3EvoiI31740fmcgflvQautYOKGw',
  
  // Master barber Julian Vance in luxury suite with client (arched back-lit mirror)
  barberSuite: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBNl0_n8sdsoeWQcyNBps5xS-076lJbmJdWXyMMFPNVO5Jgg8_lOjdyfpybin8gOdSBOaMtn_cp0qeKR-zvFq40eXPUF00BmmqJ2deW92wwdT78RcRa9oruCX7AVtWYx4tdKRwQ93kz9mIUGB3aktOXQzxgrPbx0nVreCvqOXVI7NnZo5Ke2PhulKFxBBpdwlXQiGuSrM3vK4138Z3aYJijXAwzmwXkmaICMWO5DNjjF32BdzIW2BR',
  
  // Architectural Atelier dark interior studio
  darkStudio: 'https://lh3.googleusercontent.com/aida/AEtjO1UdRa30LtdxZQWBp_222qaX-x36OQZmuh1zSTZeRobMBCWdEVDfFSl0VmF-YPLMxJa0eq29cKwoybKUe-qUHiydMhJ27gJQH-o8QTAeieLgUfZVytEIebWdP9Mj8BboObC8HWo7MjM8T-JZQDXfISdmHGJiJIikGl-RDHEepoHe4pwmZGXIDr6dXbAmaOxXZyDULDFjNKoFmI53bU111nULxpQYYhGcGXmudIJ_IGodR6p9AFyM2kyB3A',
  
  // Editorial sanctuary interior luxury chair golden hour (Suite booked)
  suiteBooked: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu9WuhP52Bm071whzoaaIMUu4v0UxmLcXFKtSFRaKt6Q1jGO8cBww2uV89JSkArsLBnUh5ESZ-x9pIw1SgbxyYgto_mcDenr8Hz-uX4_CfB1zUDjlyXPdUDs_haOJybTC-73Gj-BfUZxxzse_AYBSjcrVXh_hDvi09ZtV6wpvzgs79SpFYm0Kp3znNHePxWzHo70Bhfrf57-B0I2RWmEpC_7RLxNjAuFXiawjhpZCi-oEe1zlmGILa',
  
  // Services & rituals sanctuary hero (curved bronze backlit arch)
  servicesHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAox5c2aSrAERMGEsvKsITtuegNn03mWp5bbdt2egm2PskvSAVBk7_sOCUfSSCTgDaff-nmTQ1kFUbr97TzeZqcVoOauQULJVpyVaUn8imYIvw5UGWJGedvJMxRd_h93pHY6zieGNOIfteTX0EwoUHM_4D_-jIDhKSKUeyXt3-2TzYU4lpe2DdLWmxsjjSW7ZlKj0iU-cGqJ1fcti_7VSSfPqz86E0WSJBQeKy1lEdyhU_fWILsJMnn',
  
  // Mercer Private Courtyard map preview
  mapPreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt0Ck8Pot72sXxaIZOc_fm5g72mUijsd0YkvFqq4OPJYkPzwi9CFA8BtbTd8ig-Taox1ZEbbZVaSqyoQ1E1EVdURz-del34pvhO-OCevrz2vEQShrDE6CwklLMlU3evR1l9MT7MPYJANvtTMbvZMGirQMuMMI071CqTiAiqjP9-qT0Ajz2s5xI3Bxw1tn91QBYZrB5cvziKNNLSc8uKrtuGDueC0pzP-95KsqZxGLinWWfegdzCLQC',
  
  // Julian Vance portrait avatar in suite
  julianAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhlhtyEEuFJm40LVFiC93YJ8OkaCyMuSoG5uTBz8p2vHlMKV1zFxbe36v9U0-bmldtJGEgIT7bfPCx9rJETyiOzL5jIX9xA6_6XJRowtvrMGxQMiCzMX5eRTzDWa_v-9G6LueBq3Ste2lKOuT37g__gQEfwJOMGoFC3wjgqFbp0LWCEtnGThICXosnj0JRv1u3CQV1fFTp_x_2kgQlGjaU2r3hpqP9B2zSJ2-s5dzDXzJR02d6N4om',
  
  // Reservation summary warm salon interior at golden hour
  checkoutSuite: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5EHQ_Fg3YwH6OiX1XG7DSGuD3SJeiFq2SN6TtDNWVinyH_d2I-4QQhNcVBsSXHPBcghXKmIpgE0AFYrefJQA-VfWWvzxIJVsTRNWlBDA3svtworBhFRrp00yX6RtuaNbeNhlJYv3lsveqo4DZetJAweSiskK8O9yZqpvVczlCuQI-IYB1JuLL7a_PzFwPqcGD2M6sYkEH1MMNx_tt1k2lE9wFQ0Hj8aDl8I74xc3BHDP7y3zTtlkl',
  
  // Private suite atmosphere close-up architectural capture
  atmosphereArch: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADhcycedo591JQQxYKBuwgyBZS7V70B8EOYfMSHHGpI3_cPn8zR468MAolFwrxH0sVWjz0F8tVorWCpOHLVFVH-dGEe0iTDra-zvH-ZKlzkpx7Pv1NF88RXOD1adrlX2Q8pwUvrYlUd_JSVg0TuvMyYmEHCVShrJxSQKcmgVscp1cri2WGmul2Zg6ymsDPfLq9Sx57uecF2gg7sx9U0TUy2rdQXPUVNWDdRLpqiggNTwzN4kSxJ1RK',
  
  // "Your next cut" luxury salon interior header
  yourNextCut: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm7xdBhfX6F_GvFGN0YYtlqc4mMqbWE1qEXvVdwllA3AYz01cS_GVdgvpdLRKDhX-27XncxktBirzvZ49ev_WoL7VANmSdh3es7dh267rSOih5yJ_fvo29S0s9sRc1YMkEANyCRuRJSCVSAOEQa_BHIgeljxB3COQPvBDE9t9FLTLu4V_vMKoFNsGCuy5Dqtv0YvhfinJ-7dX5tR1OLkzLxrZyQBwxJx3afgVQlq0WB9xZ6fM802Zz'
};

// Re-exports from centralized seed data for seamless backward compatibility
export const STUDIO_DATA = STUDIO_SEED;
export const CHAIRS_DATA = CHAIRS_SEED;
export const BARBERS_DATA = BARBERS_SEED;
export const CUSTOMERS_DATA = CUSTOMERS_SEED;
export const SERVICES_DATA: Service[] = SERVICES_SEED;
export const ACCOUTREMENTS_DATA: Accoutrement[] = ACCOUTREMENTS_SEED;
export const BEVERAGE_OPTIONS: BeverageOption[] = BEVERAGE_OPTIONS_SEED;

export const INITIAL_RESERVATION: Reservation = {
  ...INITIAL_APPOINTMENT,
  reservationNumber: INITIAL_APPOINTMENT.appointmentNumber,
  artisan: INITIAL_APPOINTMENT.barberName,
  suite: INITIAL_APPOINTMENT.chairName,
  location: 'آرایشگاه رویال · سعادت‌آباد، تهران',
  selectedDate: INITIAL_APPOINTMENT.date,
  selectedTime: INITIAL_APPOINTMENT.startTime,
};

export const INITIAL_CLIENT_PROFILE: ClientProfile = DEFAULT_CLIENT_PROFILE;
export const TODAY_APPOINTMENTS_DATA = TODAY_APPOINTMENTS_SEED;
export const PAST_APPOINTMENTS_DATA = PAST_APPOINTMENTS_SEED;
export const PRODUCTS_DATA = PRODUCTS_SEED;
export const ORDERS_DATA = ORDERS_SEED;
export const NOTIFICATIONS_DATA = NOTIFICATIONS_SEED;
