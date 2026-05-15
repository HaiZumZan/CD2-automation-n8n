import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Cấu hình Mermaid (Theme dark cho đẹp)
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose'
});

const MindMap = ({ chartCode, onImageClick }) => {
    const containerRef = useRef(null);
    const [svgHtml, setSvgHtml] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!chartCode) return;
            try {
                setError(false);

                // Dọn dẹp thẻ markdown cơ bản
                let cleanCode = chartCode
                    .replace(/```mermaid/gi, "")
                    .replace(/```/g, "")
                    .trim();

                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // Hỗ trợ cả Mermaid phiên bản cũ (trả về String) và mới (trả về Object)
                const result = await mermaid.render(id, cleanCode);

                if (typeof result === 'string') {
                    setSvgHtml(result);
                } else if (result && result.svg) {
                    setSvgHtml(result.svg);
                }

            } catch (err) {
                console.error("Lỗi vẽ sơ đồ Mermaid:", err);
                setError(true);
            }
        };

        renderDiagram();
    }, [chartCode]);
    const handleContainerClick = () => {
        if (!onImageClick || !containerRef.current) return;

        // Lấy thẻ SVG để chuyển thành ảnh khi Hoa click vào
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            onImageClick(url);
        }
    };

    return (
        <div
            ref={containerRef}
            className="mindmap-wrapper"
            style={{ cursor: 'zoom-in', background: '#1e1f20', padding: '15px', borderRadius: '10px', marginTop: '10px' }}
            onClick={handleContainerClick}
        >
            {error ? (
                <p style={{ color: '#ff6b6b' }}>⚠️ Lỗi: Không thể vẽ sơ đồ từ dữ liệu AI trả về.</p>
            ) : svgHtml ? (
                <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
            ) : (
                <p style={{ color: '#888' }}>Đang vẽ sơ đồ...</p>
            )}
        </div>
    );
};

export default MindMap;