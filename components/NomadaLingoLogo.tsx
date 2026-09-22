import { useState } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { G } from 'react-native-svg';

import { Circle, Path, Svg } from '@/components/ui/primitives/Svg';
import { BRAND_COLORS, BRAND_FONTS } from '@/lib/brand';

const PIN_TILT = -24;

type PinMarkProps = {
  size?: number;
  fill?: string;
  eye?: string;
  style?: ViewStyle;
};

export function PinMark({
  size = 16,
  fill = BRAND_COLORS.teal,
  eye = BRAND_COLORS.ink,
  style,
}: PinMarkProps) {
  const width = size * (24 / 32);

  return (
    <Svg width={width} height={size} viewBox="0 0 24 32" style={style}>
      <G transform={`rotate(${PIN_TILT} 12 16)`}>
        <Path
          d="M12 0.6C5.75 0.6 0.9 5.45 0.9 11.7c0 7.9 9.03 18.2 10.35 19.66a1.02 1.02 0 0 0 1.5 0C14.07 29.9 23.1 19.6 23.1 11.7 23.1 5.45 18.25 0.6 12 0.6Z"
          fill={fill}
        />
        <Circle cx="12" cy="11.6" r="4.15" fill={eye} />
      </G>
    </Svg>
  );
}

type WordmarkProps = {
  size?: number;
  tint?: string;
  pinFill?: string;
  pinEye?: string;
  style?: ViewStyle;
};

export function NomadaLingoWordmark({
  size = 30,
  tint = BRAND_COLORS.ink,
  pinFill = BRAND_COLORS.teal,
  pinEye = BRAND_COLORS.ink,
  style,
}: WordmarkProps) {
  const [oWidth, setOWidth] = useState(0);
  const pinSize = size * 0.46;
  const textStyle = {
    fontFamily: BRAND_FONTS.display,
    fontSize: size,
    lineHeight: size * 1.14,
    letterSpacing: size * -0.03,
    color: tint,
  };

  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'flex-end' }, style]}
      accessibilityRole="image"
      accessibilityLabel="NómadaLingo"
    >
      <Text style={textStyle} allowFontScaling={false}>
        N
      </Text>
      <View onLayout={(event) => setOWidth(event.nativeEvent.layout.width)}>
        <Text style={textStyle} allowFontScaling={false}>
          o
        </Text>
        {oWidth > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: oWidth / 2 - (pinSize * (24 / 32)) / 2,
              bottom: size * 0.78,
            }}
          >
            <PinMark size={pinSize} fill={pinFill} eye={pinEye} />
          </View>
        ) : null}
      </View>
      <Text style={textStyle} allowFontScaling={false}>
        madaLingo
      </Text>
    </View>
  );
}
