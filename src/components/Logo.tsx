import React from 'react';

type LogoVariant = 'full-horizontal' | 'stacked' | 'icon-only';
type LogoTheme = 'default' | 'monochrome-white' | 'monochrome-black';

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
  iconSize?: number; 
}

export default function Logo({ 
  variant = 'full-horizontal', 
  theme = 'default', 
  className = '', 
  iconSize = 36 
}: LogoProps) {
  
  // Cores dinâmicas baseadas no tema
  const primaryColor = theme === 'monochrome-white' ? '#FFFFFF' : theme === 'monochrome-black' ? '#000000' : '#F59E0B'; // Mustard
  const secondaryColor = theme === 'monochrome-white' ? 'rgba(255,255,255,0.7)' : theme === 'monochrome-black' ? 'rgba(0,0,0,0.7)' : '#EAB308'; // Amber
  const textColor = theme === 'monochrome-white' ? '#FFFFFF' : theme === 'monochrome-black' ? '#000000' : 'currentColor';
  
  const isStacked = variant === 'stacked';
  const isIconOnly = variant === 'icon-only';

  // Ícone: Um funil geométrico moderno (V-shape) estilizado com linhas de fluxo.
  const Icon = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: iconSize, flexShrink: 0 }}
    >
      {/* Top section */}
      <rect x="4" y="6" width="40" height="10" rx="4" fill={primaryColor} opacity="0.3" />
      {/* Middle section */}
      <rect x="12" y="20" width="24" height="10" rx="4" fill={primaryColor} opacity="0.6" />
      {/* Bottom stem / conversion point */}
      <rect x="20" y="34" width="8" height="10" rx="4" fill={primaryColor} />
    </svg>
  );

  const textSize = iconSize * 0.65;
  const lineHeight = iconSize * 0.7;

  return (
    <div 
      className={`flex select-none items-center ${isStacked ? 'flex-col justify-center text-center' : 'flex-row'} ${className}`}
      style={{ gap: isStacked ? iconSize * 0.3 : iconSize * 0.4 }}
    >
      <Icon />
      
      {!isIconOnly && (
        <div 
          className="flex font-brand tracking-tight" 
          style={{ 
            color: textColor, 
            fontSize: `${textSize}px`,
            lineHeight: `${lineHeight}px`,
            flexDirection: isStacked ? 'column' : 'row',
            gap: isStacked ? '0' : '0.25em'
          }}
        >
          <span className="font-bold">Funil</span>
          <span className="font-light opacity-90">Comercial</span>
        </div>
      )}
    </div>
  );
}
