export interface ProfileAvatarItem {
  id: string;
  name: string;
  englishName: string;
  category: 'animals' | 'food' | 'objects' | 'nature';
  categoryLabel: string;
  bgColor: string;
  bgGradient: string;
  url: string;
  symbol: string;
}

export type ChromeAvatarItem = ProfileAvatarItem;
export type AvatarItem = ProfileAvatarItem;

function createProfileAvatarSvg(
  bgColor: string,
  fgColor: string,
  svgContent: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="40" fill="${bgColor}"/>
    <g transform="translate(20, 20)">
      ${svgContent}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Fox (روباه نارنجی)
const foxSvg = createProfileAvatarSvg(
  '#FF7043',
  '#FFFFFF',
  `<path d="M60 10 L85 55 L75 80 L60 90 L45 80 L35 55 Z" fill="#FFFFFF"/>
   <path d="M20 30 L45 55 L35 85 L15 65 Z" fill="#FFCCBC"/>
   <path d="M100 30 L75 55 L85 85 L105 65 Z" fill="#FFCCBC"/>
   <path d="M35 55 L60 90 L85 55 Z" fill="#FFFFFF"/>
   <polygon points="60,90 52,78 68,78" fill="#263238"/>
   <circle cx="46" cy="62" r="4" fill="#263238"/>
   <circle cx="74" cy="62" r="4" fill="#263238"/>
   <path d="M60 90 L48 108 L72 108 Z" fill="#FFFFFF"/>`
);

// 2. Cat (گربه زرد)
const catSvg = createProfileAvatarSvg(
  '#FFCA28',
  '#37474F',
  `<path d="M25 35 L40 60 L20 70 Z" fill="#FF8F00"/>
   <path d="M95 35 L80 60 L100 70 Z" fill="#FF8F00"/>
   <ellipse cx="60" cy="68" rx="38" ry="32" fill="#FFFFFF"/>
   <circle cx="45" cy="62" r="4.5" fill="#37474F"/>
   <circle cx="75" cy="62" r="4.5" fill="#37474F"/>
   <polygon points="60,74 54,68 66,68" fill="#FF8F00"/>
   <path d="M54 77 Q60 82 66 77" fill="none" stroke="#37474F" stroke-width="2.5" stroke-linecap="round"/>
   <line x1="20" y1="65" x2="38" y2="67" stroke="#B0BEC5" stroke-width="2"/>
   <line x1="20" y1="73" x2="38" y2="72" stroke="#B0BEC5" stroke-width="2"/>
   <line x1="100" y1="65" x2="82" y2="67" stroke="#B0BEC5" stroke-width="2"/>
   <line x1="100" y1="73" x2="82" y2="72" stroke="#B0BEC5" stroke-width="2"/>`
);

// 3. Dino / T-Rex (دایناسور سبز)
const dinoSvg = createProfileAvatarSvg(
  '#4CAF50',
  '#FFFFFF',
  `<path d="M68 20 H92 V28 H100 V52 H84 V44 H76 V60 H84 V68 H76 V84 H68 V100 H52 V84 H44 V68 H36 V52 H44 V36 H52 V28 H68 Z" fill="#FFFFFF"/>
   <rect x="80" y="28" width="6" height="6" fill="#4CAF50"/>
   <rect x="92" y="44" width="16" height="8" fill="#FFFFFF"/>
   <rect x="44" y="100" width="8" height="12" fill="#FFFFFF"/>
   <rect x="68" y="100" width="8" height="12" fill="#FFFFFF"/>
   <rect x="44" y="108" width="14" height="4" fill="#FFFFFF"/>
   <rect x="68" y="108" width="14" height="4" fill="#FFFFFF"/>`
);

// 4. Dog / Corgi (هاپو کرگی)
const dogSvg = createProfileAvatarSvg(
  '#FFA726',
  '#FFFFFF',
  `<ellipse cx="30" cy="45" rx="14" ry="24" fill="#E65100" transform="rotate(-15 30 45)"/>
   <ellipse cx="90" cy="45" rx="14" ry="24" fill="#E65100" transform="rotate(15 90 45)"/>
   <circle cx="60" cy="68" r="36" fill="#FFFFFF"/>
   <path d="M40 50 Q60 65 80 50 Q75 35 60 35 Q45 35 40 50 Z" fill="#FB8C00"/>
   <circle cx="46" cy="65" r="4.5" fill="#212121"/>
   <circle cx="74" cy="65" r="4.5" fill="#212121"/>
   <ellipse cx="60" cy="76" rx="7" ry="5" fill="#212121"/>
   <path d="M54 81 Q60 87 66 81" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round"/>
   <path d="M57 85 C57 91 63 91 63 85 Z" fill="#FF5252"/>`
);

// 5. Penguin (پنگوئن قطبی)
const penguinSvg = createProfileAvatarSvg(
  '#29B6F6',
  '#FFFFFF',
  `<ellipse cx="60" cy="68" rx="36" ry="42" fill="#263238"/>
   <ellipse cx="60" cy="72" rx="24" ry="32" fill="#FFFFFF"/>
   <circle cx="48" cy="52" r="4" fill="#263238"/>
   <circle cx="72" cy="52" r="4" fill="#263238"/>
   <polygon points="60,58 52,66 68,66" fill="#FF9800"/>
   <ellipse cx="38" cy="106" rx="10" ry="5" fill="#FF9800"/>
   <ellipse cx="82" cy="106" rx="10" ry="5" fill="#FF9800"/>
   <ellipse cx="20" cy="70" rx="6" ry="18" fill="#263238" transform="rotate(15 20 70)"/>
   <ellipse cx="100" cy="70" rx="6" ry="18" fill="#263238" transform="rotate(-15 100 70)"/>`
);

// 6. Panda (پاندا)
const pandaSvg = createProfileAvatarSvg(
  '#78909C',
  '#FFFFFF',
  `<circle cx="30" cy="35" r="14" fill="#263238"/>
   <circle cx="90" cy="35" r="14" fill="#263238"/>
   <circle cx="60" cy="68" r="36" fill="#FFFFFF"/>
   <ellipse cx="44" cy="62" rx="9" ry="12" fill="#263238" transform="rotate(-20 44 62)"/>
   <ellipse cx="76" cy="62" rx="9" ry="12" fill="#263238" transform="rotate(20 76 62)"/>
   <circle cx="45" cy="62" r="3.5" fill="#FFFFFF"/>
   <circle cx="75" cy="62" r="3.5" fill="#FFFFFF"/>
   <ellipse cx="60" cy="76" rx="6" ry="4.5" fill="#263238"/>
   <path d="M55 82 Q60 86 65 82" fill="none" stroke="#263238" stroke-width="2" stroke-linecap="round"/>`
);

// 7. Elephant (فیل آبی)
const elephantSvg = createProfileAvatarSvg(
  '#5C6BC0',
  '#FFFFFF',
  `<circle cx="25" cy="60" r="22" fill="#9FA8DA"/>
   <circle cx="95" cy="60" r="22" fill="#9FA8DA"/>
   <circle cx="60" cy="65" r="32" fill="#E8EAF6"/>
   <path d="M54 65 Q50 95 68 95 Q72 95 72 88 Q62 88 62 65 Z" fill="#C5CAE9"/>
   <circle cx="44" cy="58" r="4" fill="#1A237E"/>
   <circle cx="76" cy="58" r="4" fill="#1A237E"/>`
);

// 8. Butterfly (پروانه فیروزه‌ای)
const butterflySvg = createProfileAvatarSvg(
  '#26A69A',
  '#FFFFFF',
  `<path d="M60 55 C40 20 10 30 20 65 C10 85 35 105 60 75 Z" fill="#E0F2F1"/>
   <path d="M60 55 C80 20 110 30 100 65 C110 85 85 105 60 75 Z" fill="#E0F2F1"/>
   <path d="M60 55 C45 32 25 40 32 62 C25 75 42 90 60 70 Z" fill="#80CBC4"/>
   <path d="M60 55 C75 32 95 40 88 62 C95 75 78 90 60 70 Z" fill="#80CBC4"/>
   <ellipse cx="60" cy="65" rx="5" ry="24" fill="#004D40"/>
   <circle cx="60" cy="38" r="6" fill="#004D40"/>
   <path d="M58 35 Q50 20 42 22" fill="none" stroke="#004D40" stroke-width="2" stroke-linecap="round"/>
   <path d="M62 35 Q70 20 78 22" fill="none" stroke="#004D40" stroke-width="2" stroke-linecap="round"/>`
);

// 9. Flamingo (فلامینگو صورتی)
const flamingoSvg = createProfileAvatarSvg(
  '#EC407A',
  '#FFFFFF',
  `<path d="M40 95 Q60 105 75 85 Q85 70 75 50 Q65 35 45 35 Q40 35 38 40 Q40 45 48 48 Q60 52 62 65 Q50 70 40 95 Z" fill="#FFFFFF"/>
   <circle cx="45" cy="40" r="10" fill="#FFFFFF"/>
   <path d="M36 40 Q25 42 22 52 Q28 50 36 48 Z" fill="#212121"/>
   <circle cx="44" cy="38" r="2.5" fill="#212121"/>
   <line x1="55" y1="95" x2="55" y2="115" stroke="#F8BBD0" stroke-width="3"/>
   <line x1="65" y1="92" x2="75" y2="105" stroke="#F8BBD0" stroke-width="3"/>`
);

// 10. Owl (جغد دانا)
const owlSvg = createProfileAvatarSvg(
  '#8D6E63',
  '#FFFFFF',
  `<ellipse cx="60" cy="68" rx="34" ry="40" fill="#D7CCC8"/>
   <polygon points="32,36 42,48 26,50" fill="#5D4037"/>
   <polygon points="88,36 78,48 94,50" fill="#5D4037"/>
   <circle cx="45" cy="58" r="13" fill="#FFFFFF"/>
   <circle cx="75" cy="58" r="13" fill="#FFFFFF"/>
   <circle cx="45" cy="58" r="6" fill="#3E2723"/>
   <circle cx="75" cy="58" r="6" fill="#3E2723"/>
   <polygon points="60,64 54,72 66,72" fill="#FFB300"/>
   <path d="M48 84 Q60 92 72 84" fill="none" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>`
);

// 11. Pizza (اسلایس پیتزا)
const pizzaSvg = createProfileAvatarSvg(
  '#EF5350',
  '#FFFFFF',
  `<path d="M25 35 Q60 25 95 35 L60 108 Z" fill="#FFA726"/>
   <path d="M23 35 Q60 23 97 35 Q60 30 23 35 Z" fill="#D84315"/>
   <circle cx="50" cy="52" r="7" fill="#C62828"/>
   <circle cx="70" cy="62" r="6" fill="#C62828"/>
   <circle cx="58" cy="80" r="5" fill="#C62828"/>
   <rect x="42" y="68" width="6" height="3" rx="1.5" fill="#2E7D32" transform="rotate(25 42 68)"/>
   <rect x="72" y="46" width="6" height="3" rx="1.5" fill="#2E7D32" transform="rotate(-30 72 46)"/>
   <rect x="58" y="42" width="6" height="3" rx="1.5" fill="#FFF9C4" transform="rotate(10 58 42)"/>`
);

// 12. Burger (همبرگر دوبل)
const burgerSvg = createProfileAvatarSvg(
  '#FF7043',
  '#FFFFFF',
  `<path d="M30 50 Q60 25 90 50 Z" fill="#FFB74D"/>
   <rect x="26" y="52" width="68" height="6" rx="3" fill="#4CAF50"/>
   <rect x="28" y="60" width="64" height="8" rx="4" fill="#D32F2F"/>
   <rect x="26" y="70" width="68" height="10" rx="5" fill="#5D4037"/>
   <rect x="30" y="82" width="60" height="10" rx="5" fill="#FFB74D"/>
   <circle cx="45" cy="40" r="1.5" fill="#FFF8E1"/>
   <circle cx="60" cy="36" r="1.5" fill="#FFF8E1"/>
   <circle cx="75" cy="40" r="1.5" fill="#FFF8E1"/>`
);

// 13. Cupcake (کاپ‌کیک توت‌فرنگی)
const cupcakeSvg = createProfileAvatarSvg(
  '#AB47BC',
  '#FFFFFF',
  `<path d="M35 65 L42 102 H78 L85 65 Z" fill="#D7CCC8"/>
   <path d="M28 65 Q40 50 60 52 Q80 50 92 65 Q85 45 60 38 Q35 45 28 65 Z" fill="#F48FB1"/>
   <circle cx="60" cy="32" r="7" fill="#D81B60"/>
   <circle cx="46" cy="52" r="1.5" fill="#FFFFFF"/>
   <circle cx="62" cy="48" r="1.5" fill="#FFFFFF"/>
   <circle cx="74" cy="54" r="1.5" fill="#FFFFFF"/>
   <line x1="48" y1="68" x2="52" y2="98" stroke="#BCAAA4" stroke-width="2"/>
   <line x1="60" y1="68" x2="60" y2="98" stroke="#BCAAA4" stroke-width="2"/>
   <line x1="72" y1="68" x2="68" y2="98" stroke="#BCAAA4" stroke-width="2"/>`
);

// 14. Coffee (فنجان اسپرسو)
const coffeeSvg = createProfileAvatarSvg(
  '#6D4C41',
  '#FFFFFF',
  `<rect x="34" y="48" width="48" height="42" rx="8" fill="#FFFFFF"/>
   <path d="M82 56 C94 56 94 76 82 76" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
   <ellipse cx="58" cy="48" rx="24" ry="7" fill="#4E342E"/>
   <ellipse cx="58" cy="94" rx="34" ry="5" fill="#D7CCC8"/>
   <path d="M48 36 Q52 28 48 20" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
   <path d="M60 38 Q64 30 60 22" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
   <path d="M72 36 Q76 28 72 20" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`
);

// 15. Planet Saturn (سیاره زحل)
const planetSvg = createProfileAvatarSvg(
  '#3F51B5',
  '#FFFFFF',
  `<circle cx="60" cy="60" r="28" fill="#FFCA28"/>
   <ellipse cx="60" cy="60" rx="52" ry="12" fill="none" stroke="#FFE082" stroke-width="7" transform="rotate(-25 60 60)"/>
   <circle cx="48" cy="52" r="3" fill="#FFF9C4" opacity="0.7"/>
   <circle cx="70" cy="68" r="4" fill="#FFA000" opacity="0.6"/>
   <circle cx="20" cy="25" r="2" fill="#FFFFFF"/>
   <circle cx="100" cy="30" r="1.5" fill="#FFFFFF"/>
   <circle cx="95" cy="95" r="2" fill="#FFFFFF"/>`
);

// 16. Rocket (موشک فضایی)
const rocketSvg = createProfileAvatarSvg(
  '#0288D1',
  '#FFFFFF',
  `<g transform="rotate(45 60 60)">
     <path d="M60 20 C45 35 45 70 45 75 H75 C75 70 75 35 60 20 Z" fill="#ECEFF1"/>
     <path d="M60 20 C54 28 54 36 60 40 C66 36 66 28 60 20 Z" fill="#E53935"/>
     <circle cx="60" cy="52" r="7" fill="#0288D1"/>
     <circle cx="60" cy="52" r="4.5" fill="#B3E5FC"/>
     <path d="M45 65 L32 78 L45 76 Z" fill="#E53935"/>
     <path d="M75 65 L88 78 L75 76 Z" fill="#E53935"/>
     <polygon points="52,75 60,95 68,75" fill="#FF9800"/>
     <polygon points="55,75 60,88 65,75" fill="#FFEB3B"/>
   </g>`
);

// 17. Sun / Sunshine (خورشید درخشان)
const sunSvg = createProfileAvatarSvg(
  '#FBC02D',
  '#FFFFFF',
  `<circle cx="60" cy="60" r="24" fill="#FFF59D"/>
   <g stroke="#FFF59D" stroke-width="5" stroke-linecap="round">
     <line x1="60" y1="20" x2="60" y2="28"/>
     <line x1="60" y1="92" x2="60" y2="100"/>
     <line x1="20" y1="60" x2="28" y2="60"/>
     <line x1="92" y1="60" x2="100" y2="60"/>
     <line x1="32" y1="32" x2="38" y2="38"/>
     <line x1="82" y1="82" x2="88" y2="88"/>
     <line x1="32" y1="88" x2="38" y2="82"/>
     <line x1="82" y1="38" x2="88" y2="32"/>
   </g>
   <circle cx="52" cy="56" r="3.5" fill="#F57F17"/>
   <circle cx="68" cy="56" r="3.5" fill="#F57F17"/>
   <path d="M52 66 Q60 74 68 66" fill="none" stroke="#F57F17" stroke-width="2.5" stroke-linecap="round"/>`
);

// 18. Basketball (توپ بسکتبال)
const basketballSvg = createProfileAvatarSvg(
  '#E64A19',
  '#FFFFFF',
  `<circle cx="60" cy="60" r="36" fill="#FF7043"/>
   <circle cx="60" cy="60" r="36" fill="none" stroke="#212121" stroke-width="3"/>
   <line x1="24" y1="60" x2="96" y2="60" stroke="#212121" stroke-width="3"/>
   <line x1="60" y1="24" x2="60" y2="96" stroke="#212121" stroke-width="3"/>
   <path d="M35 32 Q50 60 35 88" fill="none" stroke="#212121" stroke-width="3"/>
   <path d="M85 32 Q70 60 85 88" fill="none" stroke="#212121" stroke-width="3"/>`
);

// 19. Soccer Ball (توپ فوتبال)
const soccerSvg = createProfileAvatarSvg(
  '#43A047',
  '#FFFFFF',
  `<circle cx="60" cy="60" r="36" fill="#FFFFFF"/>
   <polygon points="60,48 70,55 66,67 54,67 50,55" fill="#212121"/>
   <line x1="60" y1="48" x2="60" y2="24" stroke="#212121" stroke-width="3"/>
   <line x1="70" y1="55" x2="92" y2="45" stroke="#212121" stroke-width="3"/>
   <line x1="66" y1="67" x2="80" y2="88" stroke="#212121" stroke-width="3"/>
   <line x1="54" y1="67" x2="40" y2="88" stroke="#212121" stroke-width="3"/>
   <line x1="50" y1="55" x2="28" y2="45" stroke="#212121" stroke-width="3"/>
   <circle cx="60" cy="60" r="36" fill="none" stroke="#212121" stroke-width="3"/>`
);

// 20. Bicycle (دوچرخه شهری)
const bicycleSvg = createProfileAvatarSvg(
  '#00ACC1',
  '#FFFFFF',
  `<circle cx="36" cy="72" r="16" fill="none" stroke="#FFFFFF" stroke-width="4"/>
   <circle cx="84" cy="72" r="16" fill="none" stroke="#FFFFFF" stroke-width="4"/>
   <polyline points="36,72 54,72 68,52 48,52 36,72" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
   <line x1="68" y1="52" x2="84" y2="72" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
   <line x1="54" y1="72" x2="50" y2="44" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
   <line x1="44" y1="44" x2="56" y2="44" stroke="#263238" stroke-width="4" stroke-linecap="round"/>
   <line x1="84" y1="72" x2="78" y2="44" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
   <line x1="74" y1="44" x2="84" y2="44" stroke="#263238" stroke-width="4" stroke-linecap="round"/>`
);

export const PROFILE_AVATARS: ProfileAvatarItem[] = [
  // Animals (حیوانات و موجودات) - 10 items
  {
    id: 'av-fox',
    name: 'روباه نارنجی',
    englishName: 'Fox',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#FF7043',
    bgGradient: 'from-orange-500 to-amber-500',
    url: foxSvg,
    symbol: '🦊',
  },
  {
    id: 'av-cat',
    name: 'گربه ملوس',
    englishName: 'Cat',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#FFCA28',
    bgGradient: 'from-amber-400 to-yellow-500',
    url: catSvg,
    symbol: '🐱',
  },
  {
    id: 'av-dino',
    name: 'دایناسور سبز',
    englishName: 'Dino',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#4CAF50',
    bgGradient: 'from-emerald-500 to-green-600',
    url: dinoSvg,
    symbol: '🦖',
  },
  {
    id: 'av-corgi',
    name: 'هاپو باوفا',
    englishName: 'Dog',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#FFA726',
    bgGradient: 'from-orange-400 to-amber-500',
    url: dogSvg,
    symbol: '🐶',
  },
  {
    id: 'av-penguin',
    name: 'پنگوئن قطبی',
    englishName: 'Penguin',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#29B6F6',
    bgGradient: 'from-sky-400 to-blue-500',
    url: penguinSvg,
    symbol: '🐧',
  },
  {
    id: 'av-panda',
    name: 'خرس پاندا',
    englishName: 'Panda',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#78909C',
    bgGradient: 'from-slate-500 to-zinc-600',
    url: pandaSvg,
    symbol: '🐼',
  },
  {
    id: 'av-elephant',
    name: 'فیل آبی',
    englishName: 'Elephant',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#5C6BC0',
    bgGradient: 'from-indigo-500 to-blue-600',
    url: elephantSvg,
    symbol: '🐘',
  },
  {
    id: 'av-butterfly',
    name: 'پروانه بهاری',
    englishName: 'Butterfly',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#26A69A',
    bgGradient: 'from-teal-500 to-emerald-600',
    url: butterflySvg,
    symbol: '🦋',
  },
  {
    id: 'av-flamingo',
    name: 'فلامینگو صورتی',
    englishName: 'Flamingo',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#EC407A',
    bgGradient: 'from-pink-500 to-rose-500',
    url: flamingoSvg,
    symbol: '🦩',
  },
  {
    id: 'av-owl',
    name: 'جغد دانا',
    englishName: 'Owl',
    category: 'animals',
    categoryLabel: 'حیوانات و طبیعت',
    bgColor: '#8D6E63',
    bgGradient: 'from-stone-500 to-amber-800',
    url: owlSvg,
    symbol: '🦉',
  },

  // Food (خوراکی و کافه) - 4 items
  {
    id: 'av-pizza',
    name: 'اسلایس پیتزا',
    englishName: 'Pizza',
    category: 'food',
    categoryLabel: 'خوراکی و کافه',
    bgColor: '#EF5350',
    bgGradient: 'from-red-500 to-orange-500',
    url: pizzaSvg,
    symbol: '🍕',
  },
  {
    id: 'av-burger',
    name: 'همبرگر دوبل',
    englishName: 'Burger',
    category: 'food',
    categoryLabel: 'خوراکی و کافه',
    bgColor: '#FF7043',
    bgGradient: 'from-orange-500 to-red-500',
    url: burgerSvg,
    symbol: '🍔',
  },
  {
    id: 'av-cupcake',
    name: 'کاپ‌کیک توت‌فرنگی',
    englishName: 'Cupcake',
    category: 'food',
    categoryLabel: 'خوراکی و کافه',
    bgColor: '#AB47BC',
    bgGradient: 'from-purple-500 to-pink-500',
    url: cupcakeSvg,
    symbol: '🧁',
  },
  {
    id: 'av-coffee',
    name: 'فنجان اسپرسو',
    englishName: 'Coffee',
    category: 'food',
    categoryLabel: 'خوراکی و کافه',
    bgColor: '#6D4C41',
    bgGradient: 'from-amber-800 to-stone-800',
    url: coffeeSvg,
    symbol: '☕',
  },

  // Objects & Sports (فضا و ورزش) - 5 items
  {
    id: 'av-planet',
    name: 'سیاره زحل',
    englishName: 'Planet',
    category: 'objects',
    categoryLabel: 'فضا و اشیاء',
    bgColor: '#3F51B5',
    bgGradient: 'from-indigo-600 to-purple-600',
    url: planetSvg,
    symbol: '🪐',
  },
  {
    id: 'av-rocket',
    name: 'موشک فضایی',
    englishName: 'Rocket',
    category: 'objects',
    categoryLabel: 'فضا و اشیاء',
    bgColor: '#0288D1',
    bgGradient: 'from-cyan-600 to-blue-600',
    url: rocketSvg,
    symbol: '🚀',
  },
  {
    id: 'av-bicycle',
    name: 'دوچرخه شهری',
    englishName: 'Bicycle',
    category: 'objects',
    categoryLabel: 'فضا و اشیاء',
    bgColor: '#00ACC1',
    bgGradient: 'from-teal-600 to-cyan-600',
    url: bicycleSvg,
    symbol: '🚲',
  },
  {
    id: 'av-basketball',
    name: 'توپ بسکتبال',
    englishName: 'Basketball',
    category: 'objects',
    categoryLabel: 'فضا و اشیاء',
    bgColor: '#E64A19',
    bgGradient: 'from-orange-600 to-red-600',
    url: basketballSvg,
    symbol: '🏀',
  },
  {
    id: 'av-soccer',
    name: 'توپ فوتبال',
    englishName: 'Soccer',
    category: 'objects',
    categoryLabel: 'فضا و اشیاء',
    bgColor: '#43A047',
    bgGradient: 'from-green-600 to-emerald-700',
    url: soccerSvg,
    symbol: '⚽',
  },

  // Nature (طبیعت و نور) - 1 item
  {
    id: 'av-sun',
    name: 'خورشید درخشان',
    englishName: 'Sun',
    category: 'nature',
    categoryLabel: 'طبیعت و نور',
    bgColor: '#FBC02D',
    bgGradient: 'from-yellow-400 to-amber-500',
    url: sunSvg,
    symbol: '☀️',
  },
];

export const CHROME_AVATARS = PROFILE_AVATARS;
export const ATELIER_AVATARS = PROFILE_AVATARS;
export const DEFAULT_CLIENT_AVATAR = dinoSvg;
export const DEFAULT_BARBER_AVATAR = foxSvg;
export const DEFAULT_AVATAR = dinoSvg;

/**
 * Deterministic avatar picker for any user identifier
 */
export function getDeterministicAvatar(identifier?: string): string {
  if (!identifier) return DEFAULT_CLIENT_AVATAR;
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PROFILE_AVATARS.length;
  return PROFILE_AVATARS[index].url;
}

/**
 * Image processing helper for custom uploaded images
 */
export async function processUploadedProfileImage(file: File, maxDimension = 480, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فرمت فایل نامعتبر است'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(reader.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

