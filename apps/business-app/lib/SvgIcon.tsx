import { Svg, Path } from 'react-native-svg'
import { ICON_PATHS, IconName } from './theme'

type Props = {
  name: IconName
  size?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
}

export function SvgIcon({ name, size = 18, stroke = 'currentColor', strokeWidth = 1.8, fill = 'none' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path
        d={ICON_PATHS[name]}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  )
}
