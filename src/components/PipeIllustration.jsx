// 상하수도설비공사를 형상화한 배관 네트워크 라인아트. 사진 대신 사용하는 장식용 그래픽.
function PipeIllustration({ className }) {
  return (
    <svg viewBox="0 0 480 480" className={className} role="img" aria-label="상하수도 배관 네트워크 일러스트">
      <rect width="480" height="480" fill="var(--color-navy-900)" />

      {/* 배경 격자 (청사진 느낌) */}
      <g stroke="var(--color-navy-700)" strokeWidth="1">
        {[80, 160, 240, 320, 400].map((n) => (
          <line key={`v${n}`} x1={n} y1="0" x2={n} y2="480" />
        ))}
        {[80, 160, 240, 320, 400].map((n) => (
          <line key={`h${n}`} x1="0" y1={n} x2="480" y2={n} />
        ))}
      </g>

      {/* 배관 라인 */}
      <g fill="none" stroke="var(--color-orange-500)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 340 H160 V180 H300" />
        <path d="M160 340 V400" opacity="0.55" />
        <path d="M300 180 V80" />
        <path d="M300 260 H420" opacity="0.55" />
        <path d="M300 180 V260" opacity="0.55" />
      </g>

      {/* 이음부 */}
      <g fill="var(--color-navy-900)" stroke="var(--color-orange-500)" strokeWidth="4">
        <circle cx="160" cy="340" r="7" />
        <circle cx="160" cy="180" r="7" />
        <circle cx="300" cy="180" r="7" />
        <circle cx="300" cy="260" r="7" />
      </g>

      {/* 밸브 게이지 */}
      <g stroke="var(--color-gray-100)" strokeWidth="4" fill="none" strokeLinecap="round">
        <circle cx="300" cy="80" r="34" />
        <path d="M300 52 V108 M272 80 H328" />
      </g>

      {/* 물방울 */}
      <g transform="translate(24, 268) scale(1.6) translate(-12, -13)" fill="var(--color-gray-100)" opacity="0.9">
        <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
      </g>
    </svg>
  )
}

export default PipeIllustration
