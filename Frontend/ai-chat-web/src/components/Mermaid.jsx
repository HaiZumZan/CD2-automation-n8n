import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Cấu hình mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark', // Phù hợp với giao diện Dark Mode của Hoa
  securityLevel: 'loose',
});

const Mermaid = ({ chart, onImageClick }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      // Xóa nội dung cũ trước khi vẽ mới
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className="mermaid" 
      style={{ cursor: 'zoom-in', background: '#1e1f20', padding: '10px', borderRadius: '10px' }}
      onClick={() => {
          // Mẹo: Lấy mã SVG đã vẽ để làm ảnh phóng to
          const svg = ref.current.querySelector('svg');
          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            onImageClick(url);
          }
      }}
    >
      {chart}
    </div>
  );
};

export default Mermaid;