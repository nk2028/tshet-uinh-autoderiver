import styled from "@emotion/styled";

const Svg = styled.svg`
  animation: rotate 1s linear infinite;
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
const Circle = styled.circle`
  animation: dash 0.75s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  transform-origin: center;
  @keyframes dash {
    from {
      stroke-dashoffset: 38;
      transform: rotate(0rad);
    }
    to {
      stroke-dashoffset: 17;
      transform: rotate(-1rad);
    }
  }
`;

export default function Spinner() {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="4rem" height="4rem">
      <Circle
        cx={8}
        cy={8}
        r={7}
        stroke="#ccc"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={14 * Math.PI}
      />
    </Svg>
  );
}
