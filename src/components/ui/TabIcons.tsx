import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { Colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  active?: boolean;
  accentColor?: string;
}

const INACTIVE = Colors.tx3; // '#AFA090'

export const HomeIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {active && (
        <Path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={accentColor + '22'}
        />
      )}
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const LotusIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx={12} cy={12} rx={3} ry={6} stroke={color} strokeWidth={1.7} />
      <Ellipse
        cx={12}
        cy={12}
        rx={3}
        ry={6}
        stroke={color}
        strokeWidth={1.7}
        transform="rotate(45 12 12)"
      />
      <Ellipse
        cx={12}
        cy={12}
        rx={3}
        ry={6}
        stroke={color}
        strokeWidth={1.7}
        transform="rotate(90 12 12)"
      />
      <Ellipse
        cx={12}
        cy={12}
        rx={3}
        ry={6}
        stroke={color}
        strokeWidth={1.7}
        transform="rotate(135 12 12)"
      />
      <Circle cx={12} cy={12} r={2.2} fill={color} />
    </Svg>
  );
};

export const InboxIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={6} width={18} height={13} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M3 8L12 13.5L21 8" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
};

export const PersonIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path
        d="M4 20C4 16.13 7.58 13 12 13C16.42 13 20 16.13 20 20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const BellIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 17H4L6 9C6 6.24 8.69 4 12 4C15.31 4 18 6.24 18 9L20 17Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M12 22C10.89 22 10 21.1 10 20H14C14 21.1 13.11 22 12 22"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const DashboardIcon: React.FC<IconProps> = ({
  size = 24,
  active,
  accentColor = Colors.bl,
}) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={3} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
};

export const PeopleIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.bl }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7.5} r={3} stroke={color} strokeWidth={1.8} />
      <Path
        d="M2 20C2 16.68 5.13 14.5 9 14.5C12.87 14.5 16 16.68 16 20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={17} cy={7.5} r={2.5} stroke={color} strokeWidth={1.6} opacity={0.6} />
      <Path
        d="M19 14.5C20.9 15.2 22 16.8 22 20"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
};

export const LightningIcon: React.FC<IconProps> = ({
  size = 24,
  active,
  accentColor = Colors.bl,
}) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CalendarIcon: React.FC<IconProps> = ({
  size = 24,
  active,
  accentColor = Colors.bl,
}) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={16} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M3 10H21" stroke={color} strokeWidth={1.8} />
      <Path d="M8 3V7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 3V7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Rect x={7} y={13} width={3} height={2} rx={0.5} fill={color} />
      <Rect x={11} y={13} width={3} height={2} rx={0.5} fill={color} />
      <Rect x={15} y={13} width={3} height={2} rx={0.5} fill={color} />
    </Svg>
  );
};

export const ListIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sf }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 12H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 18H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={4} cy={6} r={1.3} fill={color} />
      <Circle cx={4} cy={12} r={1.3} fill={color} />
      <Circle cx={4} cy={18} r={1.3} fill={color} />
    </Svg>
  );
};

export const AppsIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.bl }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.7} />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.7} />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.7} />
      <Rect x={14} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.7} />
    </Svg>
  );
};

export const SearchIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.sv }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.8} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
};

export const WrenchIcon: React.FC<IconProps> = ({ size = 24, active, accentColor = Colors.bl }) => {
  const color = active ? accentColor : INACTIVE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
