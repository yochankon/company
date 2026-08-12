// 상하수도설비공사를 형상화한 정밀 배관 청사진 일러스트. 사진 대신 사용하는 장식용 그래픽.
function PipeIllustration({ className }) {
  return (
    <svg viewBox="0 0 480 480" className={className} role="img" aria-label="상하수도 배관 네트워크 정밀 일러스트">
      <rect width="480" height="480" fill="var(--color-navy-900)" />

      {/* 배경 격자 */}
      <g stroke="var(--color-navy-700)" strokeWidth="1">
        {[80, 160, 240, 320, 400].map((n) => (
          <line key={`v${n}`} x1={n} y1="0" x2={n} y2="480" />
        ))}
        {[80, 160, 240, 320, 400].map((n) => (
          <line key={`h${n}`} x1="0" y1={n} x2="480" y2={n} />
        ))}
      </g>

      {/* 모서리 기준점 (도면 느낌) */}
      <g stroke="var(--color-orange-500)" strokeWidth="2" opacity="0.6">
        {[
          [28, 28],
          [452, 28],
          [28, 452],
          [452, 452],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
            <line x1={x} y1={y - 8} x2={x} y2={y + 8} />
          </g>
        ))}
      </g>

      {/* 지표면 라인 + 해칭 */}
      <line x1="40" y1="72" x2="260" y2="72" stroke="var(--color-orange-500)" strokeWidth="5" strokeLinecap="round" />
      <g stroke="var(--color-orange-500)" strokeWidth="2" opacity="0.5">
        {[48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240].map((x) => (
          <line key={x} x1={x} y1="72" x2={x - 8} y2="86" />
        ))}
      </g>

      {/* 맨홀 */}
      <circle cx="120" cy="72" r="15" fill="var(--color-navy-900)" stroke="var(--color-gray-100)" strokeWidth="3" />
      <circle cx="120" cy="72" r="8" fill="none" stroke="var(--color-gray-100)" strokeWidth="2" />

      {/* 중심 기준선 */}
      <line
        x1="120"
        y1="87"
        x2="120"
        y2="420"
        stroke="var(--color-gray-400)"
        strokeWidth="1"
        strokeDasharray="10 4 2 4"
        opacity="0.3"
      />

      {/* 배관 네트워크 */}
      <g fill="none" stroke="var(--color-orange-500)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 87 V180 H340" />
        <path d="M340 180 V260 H200" />
        <path d="M200 260 V338" />
      </g>

      {/* 흐름 화살표 */}
      <g stroke="var(--color-gray-100)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55">
        <path d="M180 176 l8 4 l-8 4" />
        <path d="M220 176 l8 4 l-8 4" />
        <path d="M260 176 l8 4 l-8 4" />
      </g>

      {/* 이음부 */}
      <g fill="var(--color-navy-900)" stroke="var(--color-orange-500)" strokeWidth="4">
        <circle cx="120" cy="180" r="7" />
        <circle cx="340" cy="180" r="7" />
        <circle cx="340" cy="260" r="7" />
        <circle cx="200" cy="260" r="7" />
      </g>

      {/* 밸브 게이지 */}
      <g stroke="var(--color-gray-100)" strokeWidth="4" fill="none" strokeLinecap="round">
        <circle cx="200" cy="368" r="30" />
        <circle cx="200" cy="368" r="30" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.5" />
        <path d="M200 342 V394 M174 368 H226" />
      </g>

      {/* 치수선 */}
      <g stroke="var(--color-gray-400)" strokeWidth="1.5" opacity="0.5">
        <line x1="120" y1="412" x2="340" y2="412" />
        <line x1="120" y1="406" x2="120" y2="418" />
        <line x1="340" y1="406" x2="340" y2="418" />
      </g>

      {/* 물방울 */}
      <g transform="translate(60, 340) scale(1.5) translate(-12, -13)" fill="var(--color-gray-100)" opacity="0.9">
        <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
      </g>
      <g transform="translate(400, 300) scale(1) translate(-12, -13)" fill="var(--color-gray-100)" opacity="0.55">
        <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
      </g>
    </svg>
  )
}

export default PipeIllustration
