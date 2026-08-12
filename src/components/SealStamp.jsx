// 요찬토건(堯燦土建) 한자 인장 - 서명란 옆에 붙이는 장식용 도장
function SealStamp({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="요찬토건 한자 도장 (堯燦土建)">
      <rect x="8" y="8" width="104" height="104" rx="3" fill="none" stroke="#b3382c" strokeWidth="6" />
      <text x="34" y="50" fontSize="38" fontFamily="'Noto Serif KR', serif" fontWeight="700" fill="#b3382c" textAnchor="middle">
        堯
      </text>
      <text x="86" y="50" fontSize="38" fontFamily="'Noto Serif KR', serif" fontWeight="700" fill="#b3382c" textAnchor="middle">
        燦
      </text>
      <text x="34" y="102" fontSize="38" fontFamily="'Noto Serif KR', serif" fontWeight="700" fill="#b3382c" textAnchor="middle">
        土
      </text>
      <text x="86" y="102" fontSize="38" fontFamily="'Noto Serif KR', serif" fontWeight="700" fill="#b3382c" textAnchor="middle">
        建
      </text>
    </svg>
  )
}

export default SealStamp
